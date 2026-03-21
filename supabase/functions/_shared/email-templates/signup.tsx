/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to Flintyo – confirm your email</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={logo}>⚡ Flintyo</Text>
        <Heading style={h1}>Welcome aboard!</Heading>
        <Text style={text}>
          You just signed up for{' '}
          <Link href={siteUrl} style={link}>
            <strong>Flintyo</strong>
          </Link>
          — the anonymous platform for honest conversations and debates.
        </Text>
        <Text style={text}>
          Confirm your email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) to get your LabsID and start sharing:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify & Get Started
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#0c1222', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '480px', margin: '0 auto' }
const logo = { fontSize: '20px', fontWeight: 'bold' as const, color: '#0ea5e9', margin: '0 0 30px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#e8eaed', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#8b8fa3', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#0ea5e9', textDecoration: 'underline' }
const button = {
  backgroundColor: '#0ea5e9',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#555770', margin: '30px 0 0' }
