import { createClient } from 'npm:@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.16'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const SITE_URL = 'https://flintyo.com'
const FROM_ADDRESS = 'Flintyo <no-reply@flintyo.com>'
const LOGO_URL = `${SITE_URL}/flintyo-logo.png`

function buildBroadcastHtml(type: string): string {
  if (type === 'shutdown') {
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background-color:#0c1222;font-family:'Space Grotesk',Arial,sans-serif;margin:0;padding:0;">
<div style="max-width:480px;margin:0 auto;padding:40px 25px;">
  <a href="${SITE_URL}" style="display:inline-block;margin:0 0 30px;text-decoration:none;">
    <img src="${LOGO_URL}" alt="Flintyo" width="140" height="140" style="display:block;width:140px;height:auto;border:0;" />
  </a>
  <h1 style="font-size:26px;font-weight:bold;color:#e8eaed;margin:0 0 20px;">Flintyo is Shutting Down 😔</h1>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 10px;">Hey there, anonymous one.</p>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 10px;">We have some difficult news to share. <strong style="color:#e8eaed;">Project Flintyo is officially shutting down.</strong></p>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 15px;">All data — including your Flints, debates, chats, profile, and account — <strong style="color:#ef4444;">will be permanently deleted within 24 hours.</strong></p>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 5px;">This means:</p>
  <ul style="font-size:15px;color:#8b8fa3;line-height:2;margin:0 0 20px;padding-left:20px;">
    <li>🔥 All your Flints will be removed</li>
    <li>⚔️ All debate history will be erased</li>
    <li>💬 All chat conversations will be deleted</li>
    <li>👤 Your profile and points will be wiped</li>
    <li>📧 Your account will be permanently deleted</li>
  </ul>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 10px;">We want to sincerely thank you for being part of the Flintyo community. Every thought you shared, every debate you sparked, and every anonymous conversation you had — it all mattered.</p>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 25px;">Thank you for believing in honest, anonymous expression. 🙏</p>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 5px;">With gratitude,</p>
  <p style="font-size:15px;color:#e8eaed;font-weight:bold;margin:0 0 20px;">The Flintyo Team</p>
  <hr style="border:none;border-top:1px solid #1e293b;margin:30px 0 15px;" />
  <p style="font-size:11px;color:#555770;margin:0;">You're receiving this because you're a member of <a href="${SITE_URL}" style="color:#0ea5e9;text-decoration:none;">Flintyo</a>.</p>
</div>
</body></html>`
  }

  if (type === 'review') {
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background-color:#0c1222;font-family:'Space Grotesk',Arial,sans-serif;margin:0;padding:0;">
<div style="max-width:480px;margin:0 auto;padding:40px 25px;">
  <a href="${SITE_URL}" style="display:inline-block;margin:0 0 30px;text-decoration:none;">
    <img src="${LOGO_URL}" alt="Flintyo" width="140" height="140" style="display:block;width:140px;height:auto;border:0;" />
  </a>
  <h1 style="font-size:26px;font-weight:bold;color:#e8eaed;margin:0 0 20px;">We'd love your feedback! ⭐</h1>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 10px;">Hey there, anonymous one!</p>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 10px;">You've been part of the Flintyo community — sharing thoughts, clashing in debates, and talking with strangers. That means a lot to us.</p>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 25px;">We'd really appreciate it if you could take a moment to review the app. Your feedback helps us make Flintyo even better for everyone. 🙏</p>
  <a href="${SITE_URL}" style="display:inline-block;background-color:#0ea5e9;color:#ffffff;font-size:15px;font-weight:bold;border-radius:12px;padding:14px 32px;text-decoration:none;margin:0 0 20px;">Open Flintyo & Review ⭐</a>
  <p style="font-size:13px;color:#555770;margin:30px 0 0;">Love the app? Tell your friends about it! Hate something? Tell us — we're listening.</p>
  <hr style="border:none;border-top:1px solid #1e293b;margin:30px 0 15px;" />
  <p style="font-size:11px;color:#555770;margin:0;">You're receiving this because you're a member of <a href="${SITE_URL}" style="color:#0ea5e9;text-decoration:none;">Flintyo</a>.</p>
</div>
</body></html>`
  }

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background-color:#0c1222;font-family:'Space Grotesk',Arial,sans-serif;margin:0;padding:0;">
<div style="max-width:480px;margin:0 auto;padding:40px 25px;">
  <a href="${SITE_URL}" style="display:inline-block;margin:0 0 30px;text-decoration:none;">
    <img src="${LOGO_URL}" alt="Flintyo" width="140" height="140" style="display:block;width:140px;height:auto;border:0;" />
  </a>
  <h1 style="font-size:26px;font-weight:bold;color:#e8eaed;margin:0 0 20px;">What's on your mind? 🔥</h1>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 10px;">Got a hot take? An unpopular opinion? A question that keeps you up at night?</p>
  <p style="font-size:15px;color:#8b8fa3;line-height:1.7;margin:0 0 25px;">The Flintyo community is waiting to hear it. Drop your thought anonymously and see how the world reacts.</p>
  <a href="${SITE_URL}/create" style="display:inline-block;background-color:#0ea5e9;color:#ffffff;font-size:15px;font-weight:bold;border-radius:12px;padding:14px 32px;text-decoration:none;margin:0 0 20px;">Let's Flint It 🚀</a>
  <p style="font-size:13px;color:#555770;margin:30px 0 0;">You can also <a href="${SITE_URL}/profile" style="color:#0ea5e9;text-decoration:none;">check your profile</a> to see your rank and stats.</p>
  <hr style="border:none;border-top:1px solid #1e293b;margin:30px 0 15px;" />
  <p style="font-size:11px;color:#555770;margin:0;">You're receiving this because you're a member of <a href="${SITE_URL}" style="color:#0ea5e9;text-decoration:none;">Flintyo</a>.</p>
</div>
</body></html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse optional type from body
    let emailType = 'engage'
    try {
      const body = await req.json()
      if (body?.type) emailType = body.type
    } catch { /* no body, use default */ }

    const smtpHost = Deno.env.get('SMTP_HOST')
    const smtpPort = Deno.env.get('SMTP_PORT')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASS')

    if (!smtpHost || !smtpUser || !smtpPass) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: users, error } = await supabase
      .from('users')
      .select('email')

    if (error || !users?.length) {
      console.error('Failed to fetch users', error)
      return new Response(JSON.stringify({ error: 'No users found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '465'),
      secure: (smtpPort || '465') === '465',
      auth: { user: smtpUser, pass: smtpPass },
    })

    const html = buildBroadcastHtml(emailType)
    const subject = emailType === 'shutdown'
      ? "Important: Flintyo is Shutting Down"
      : emailType === 'review'
      ? "⭐ We'd love your feedback on Flintyo!"
      : "🔥 What's on your mind? Let's Flint it!"

    let sent = 0
    let failed = 0

    for (const user of users) {
      try {
        await transporter.sendMail({
          from: FROM_ADDRESS,
          to: user.email,
          subject,
          html,
        })
        sent++
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 200))
      } catch (e) {
        console.error(`Failed to send to ${user.email}:`, e)
        failed++
      }
    }

    console.log(`Broadcast complete: ${sent} sent, ${failed} failed`)

    return new Response(
      JSON.stringify({ success: true, sent, failed, total: users.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Broadcast error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
