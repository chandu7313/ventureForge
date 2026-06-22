import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_${user.id}`,
    };

    return this.razorpay.orders.create(options);
  }

  verifySignature(orderId: string, paymentId: string, signature: string) {
    const text = orderId + "|" + paymentId;
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    
    const expectedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');
    
    return expectedSignature === signature;
  }

  async createCreditOrder(userId: string, packageId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    let amount = 0;
    if (packageId === 'STARTER') amount = 499;
    else if (packageId === 'PRO') amount = 1499;
    else if (packageId === 'AGENCY') amount = 2999;
    else throw new BadRequestException('Invalid package ID');

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_${user.id}_${Date.now()}`,
    };

    return this.razorpay.orders.create(options);
  }

  async verifyPaymentAndAddCredits(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string,
    packageId: string
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const isValid = this.verifySignature(orderId, paymentId, signature);
    if (!isValid) throw new BadRequestException('Invalid signature');

    let creditsToAdd = 0;
    if (packageId === 'STARTER') creditsToAdd = 500;
    else if (packageId === 'PRO') creditsToAdd = 2000;
    else if (packageId === 'AGENCY') creditsToAdd = 5000;

    await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: creditsToAdd } },
    });

    return { success: true, creditsAdded: creditsToAdd };
  }

  async getInvoices(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [];

    // For a real app, you would query your DB for payments or Razorpay for payments linked to user's email
    return [
      { id: 'inv_mock', date: new Date(), amount: 499, status: 'paid', downloadUrl: '#' }
    ];
  }

  async handleWebhook(body: any, signature: string) {
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) return { status: 'ignored' };

    const expectedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Credits are added synchronously via verifyPaymentAndAddCredits frontend callback
    // Real implementation would safely handle asynchronous additions here
    return { status: 'ok' };
  }
}
