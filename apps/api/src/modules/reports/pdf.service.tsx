import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Report, Idea } from '@prisma/client';

// We fall back to standard fonts to avoid network dependency in the backend
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  coverPage: {
    backgroundColor: '#0f172a',
    padding: 60,
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
    borderBottom: '2px solid #22c55e',
    paddingBottom: 5,
  },
  card: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  text: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.5,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  col: {
    width: '48%',
  }
});

const ReportDocument = ({ report, idea }: { report: any, idea: any }) => (
  <Document>
    {/* Page 1: Cover */}
    <Page size="A4" style={[styles.page, styles.coverPage]}>
      <Text style={styles.title}>{idea.name}</Text>
      <Text style={styles.subtitle}>Industry: {idea.industry}</Text>
      <Text style={styles.subtitle}>Stage: {idea.stage}</Text>
      <Text style={styles.subtitle}>Generated: {new Date(report.createdAt).toLocaleDateString()}</Text>
      <View style={{ marginTop: 50 }}>
        <Text style={{ fontSize: 24, color: '#22c55e' }}>Investor Score: {report.investorScore}/100</Text>
        <Text style={{ fontSize: 24, color: '#38bdf8' }}>Verdict: {report.verdict}</Text>
      </View>
    </Page>

    {/* Page 2: Market Analysis */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Market Analysis</Text>
      <View style={styles.card}>
        <Text style={[styles.text, styles.bold]}>Total Addressable Market (TAM)</Text>
        <Text style={styles.text}>${report.marketData?.tam?.usdM}M | ₹{report.marketData?.tam?.inrCr}Cr (CAGR: {report.marketData?.tam?.cagr}%)</Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.text, styles.bold]}>Serviceable Addressable Market (SAM)</Text>
        <Text style={styles.text}>${report.marketData?.sam?.usdM}M | ₹{report.marketData?.sam?.inrCr}Cr</Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.text, styles.bold]}>Serviceable Obtainable Market (SOM)</Text>
        <Text style={styles.text}>${report.marketData?.som?.usdM}M | ₹{report.marketData?.som?.inrCr}Cr</Text>
      </View>
      <Text style={styles.text}>{report.marketData?.analysis}</Text>
    </Page>

    {/* Page 3: Competitors */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Competitive Landscape</Text>
      {report.competitorData?.competitors?.slice(0, 4).map((c: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={[styles.text, styles.bold]}>{c.name} ({c.type})</Text>
          <Text style={styles.text}>Funding: {c.fundingStage} ({c.totalFunding})</Text>
          <Text style={styles.text}>Weakness: {c.weakness}</Text>
        </View>
      ))}
    </Page>

    {/* Page 4: Risks */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Risk Assessment</Text>
      {report.riskData?.map((r: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={[styles.text, styles.bold]}>{r.category} Risk ({r.severity})</Text>
          <Text style={styles.text}>{r.description}</Text>
          <Text style={styles.text}>Mitigation: {r.mitigation}</Text>
        </View>
      ))}
    </Page>

    {/* Page 5: Monetization */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Monetization & Funding</Text>
      <Text style={styles.text}>{report.monetizationData?.monetization}</Text>
      <Text style={[styles.text, styles.bold, { marginTop: 20 }]}>Funding Recommendation</Text>
      <Text style={styles.text}>{report.monetizationData?.fundingRecommendation}</Text>
    </Page>

    {/* Page 6: MVP Roadmap */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>MVP Roadmap</Text>
      {report.mvpData?.map((m: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={[styles.text, styles.bold]}>Phase {m.phase}: {m.title}</Text>
          <Text style={styles.text}>Duration: {m.duration}</Text>
          <Text style={styles.text}>Milestone: {m.milestone}</Text>
        </View>
      ))}
    </Page>

    {/* Page 7: GTM Strategy */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Go-to-Market Strategy</Text>
      {report.gtmData?.map((g: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={[styles.text, styles.bold]}>{g.channel}</Text>
          <Text style={styles.text}>{g.strategy}</Text>
          <Text style={styles.text}>Expected CAC: {g.expectedCAC}</Text>
        </View>
      ))}
    </Page>

    {/* Page 8: Investor Readiness */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Investor Readiness</Text>
      {report.investorData?.map((d: any, i: number) => (
        <View key={i} style={styles.row}>
          <View style={styles.col}>
            <Text style={[styles.text, styles.bold]}>{d.name}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.text}>{d.score}/10 - {d.reasoning}</Text>
          </View>
        </View>
      ))}
    </Page>

    {/* Page 9: Pitch Deck */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Pitch Deck Skeleton</Text>
      {report.pitchData?.map((p: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={[styles.text, styles.bold]}>Slide {i+1}: {p.title}</Text>
          <Text style={styles.text}>{p.content}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private configService: ConfigService) {}

  async generatePDF(report: Report, idea: Idea): Promise<string> {
    this.logger.log(`Generating PDF for report ${report.id}`);
    
    try {
      const pdfBuffer = await renderToBuffer(<ReportDocument report={report} idea={idea} />);

      // Return as a base64 data URL that the frontend can use directly
      const base64 = pdfBuffer.toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64}`;

      this.logger.log(`PDF generated for report ${report.id} (${pdfBuffer.length} bytes)`);
      return dataUrl;

    } catch (err) {
      this.logger.error(`Failed to generate PDF: ${(err as Error).message}`);
      throw new HttpException('PDF generation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
