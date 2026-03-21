import { createClient } from 'npm:@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.16'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_URL = 'https://flintyo.com'
const FROM_ADDRESS = 'Flintyo <no-reply@flintyo.com>'

function buildEmailHtml(title: string, body: string, ctaText?: string, ctaUrl?: string): string {
  const ctaBlock = ctaText && ctaUrl
    ? `<a href="${ctaUrl}" style="display:inline-block;background-color:#0ea5e9;color:#ffffff;font-size:14px;font-weight:bold;border-radius:12px;padding:14px 28px;text-decoration:none;margin:10px 0 20px;">${ctaText}</a>`
    : ''

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background-color:#0c1222;font-family:'Space Grotesk',Arial,sans-serif;margin:0;padding:0;">
<div style="max-width:480px;margin:0 auto;padding:40px 25px;">
  <p style="font-size:20px;font-weight:bold;color:#0ea5e9;margin:0 0 30px;">⚡ Flintyo</p>
  <h1 style="font-size:24px;font-weight:bold;color:#e8eaed;margin:0 0 20px;">${title}</h1>
  <p style="font-size:14px;color:#8b8fa3;line-height:1.6;margin:0 0 20px;">${body}</p>
  ${ctaBlock}
  <p style="font-size:12px;color:#555770;margin:30px 0 0;">You're receiving this because of your activity on Flintyo.</p>
</div>
</body></html>`
}

function getEmailContent(type: string, title: string, message: string, link: string | null) {
  const ctaUrl = link ? `${SITE_URL}${link}` : SITE_URL

  const templates: Record<string, { subject: string; cta: string }> = {
    clash_challenge: { subject: '⚔️ New Clash Challenge!', cta: 'View Challenge' },
    clash_accepted: { subject: '⚔️ Challenge Accepted!', cta: 'Join Debate' },
    clash_result: { subject: '🏆 Clash Results', cta: 'View Results' },
    chat_match: { subject: '💬 Chat Matched!', cta: 'Open Chat' },
    comment: { subject: '💬 New Comment on Your Flint', cta: 'View Discussion' },
    rank_change: { subject: '🎖️ You Ranked Up!', cta: 'View Profile' },
  }

  const tmpl = templates[type] || { subject: title, cta: 'Open Flintyo' }
  const finalCtaUrl = type === 'rank_change' ? `${SITE_URL}/profile` : ctaUrl

  return {
    subject: tmpl.subject,
    html: buildEmailHtml(title, message, tmpl.cta, finalCtaUrl),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate SMTP config
    const smtpHost = Deno.env.get('SMTP_HOST')
    const smtpPort = Deno.env.get('SMTP_PORT')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASS')

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('SMTP credentials not configured')
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { user_id, type, title, message, link } = await req.json()

    if (!user_id || !type || !title || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Look up user email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', user_id)
      .single()

    if (userError || !user?.email) {
      console.error('User lookup failed', { user_id, error: userError })
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const emailContent = getEmailContent(type, title, message, link)

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '465'),
      secure: (smtpPort || '465') === '465',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // Send email
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    console.log('Notification email sent', { type, email: user.email, messageId: info.messageId })

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending notification email:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
