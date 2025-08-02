
import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text } from '@react-email/components';

interface EmailTemplateProps {
  username: string;
  otp: string;
}

export default function EmailTemplate({ username, otp }: EmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Your OTP for verification</Preview>
      <Body style={{ backgroundColor: '#f9f9f9', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ background: '#fff', borderRadius: 8, maxWidth: 480, margin: '40px auto', border: '1px solid #eaeaea', padding: 32 }}>
          <Section>
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#222', marginBottom: 8 }}>
              Welcome, {username}
            </Text>
            <Text style={{ fontSize: 16, color: '#444', marginBottom: 24 }}>
              Thanks for using our services.
            </Text>
            <Text style={{ fontSize: 16, color: '#222', marginBottom: 8 }}>
              Please use the following One-Time Password (OTP) to verify your account:
            </Text>
            <Section style={{
              background: '#f4f8fb',
              border: '1px dashed #0070f3',
              borderRadius: 6,
              padding: '18px 0',
              textAlign: 'center',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 6,
              color: '#0070f3',
              margin: '16px 0 24px 0',
            }}>
              {otp}
            </Section>
            <Text style={{ color: '#888', fontSize: 14 }}>
              This OTP is valid for a limited time. If you did not request this, please ignore this email.
            </Text>
            <Text style={{ color: '#bbb', fontSize: 12, marginTop: 32 }}>
              &copy; {new Date().getFullYear()} Home Manager. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}