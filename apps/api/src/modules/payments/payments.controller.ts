import { Controller, Post, Get, Body, Headers, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('buy-credits')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create Razorpay order for credits' })
  async buyCredits(@CurrentUser() userId: string, @Body() data: { packageId: string }) {
    if (!['STARTER', 'PRO', 'AGENCY'].includes(data.packageId)) throw new BadRequestException('Invalid package');
    return this.paymentsService.createCreditOrder(userId, data.packageId);
  }

  @Post('verify-payment')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Verify payment and add credits' })
  async verifyPayment(
    @CurrentUser() userId: string,
    @Body() data: { orderId: string; paymentId: string; signature: string; packageId: string }
  ) {
    return this.paymentsService.verifyPaymentAndAddCredits(
      userId,
      data.orderId,
      data.paymentId,
      data.signature,
      data.packageId
    );
  }

  @Get('invoices')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get past invoices' })
  async getInvoices(@CurrentUser() userId: string) {
    return this.paymentsService.getInvoices(userId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Razorpay webhook handler' })
  async webhook(@Body() body: any, @Headers('x-razorpay-signature') signature: string) {
    return this.paymentsService.handleWebhook(body, signature);
  }
}
