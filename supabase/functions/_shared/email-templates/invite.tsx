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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to Flintyo</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={logo}>⚡ Flintyo</Text>
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>Flintyo</strong>
          </Link>
          — the anonymous platform for real conversations. Accept below to get started.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
