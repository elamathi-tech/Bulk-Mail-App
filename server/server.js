import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Resend } from 'resend'

dotenv.config()

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://bulk-mail-app-xi.vercel.app'
  ]
}))
app.use(express.json())

const emailSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    recipients: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

const EmailRecord = mongoose.model('EmailRecord', emailSchema);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Bulk Mail API is running' })
});

app.post('/api/emails/send', async (req, res) => {
  const { subject, body, recipients } = req.body

  const recipientList = (
    Array.isArray(recipients)
      ? recipients
      : typeof recipients === 'string'
        ? recipients.split(',')
        : []
  )

    .map(email => email.trim())
    .filter(Boolean)

  if (
    typeof subject !== 'string' ||
    !subject.trim() ||
    typeof body !== 'string' ||
    !body.trim() ||
    recipientList.length === 0
  ) {
    return res.status(400).json({
      message: 'Subject, email body, and recipients are required.'
    })
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!recipientList.every(email => emailPattern.test(email))) {
    return res.status(400).json({
      message: 'Please enter valid recipient email address.'
    });
  }

  let record

  try {
    record = await EmailRecord.create({
      subject: subject.trim(),
      body,
      recipients: recipientList,
      status: 'pending'
    })


    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'Bulk Mail App <onboarding@resend.dev>',
      to: ['elamathi24it@gmail.com'],
      bcc: recipientList,
      subject: subject.trim(),
      text: body
    });

    if (error) {
      throw new Error(error.message);
    }

    record.status = 'sent'
    await record.save()

    return res.json({
      message: `Email submitted successfully to ${recipientList.length} recipient(s).`,
      record
    });
  } catch (error) {
    console.error('Email sending error:', error.message)

    if (record) {
      try {
        record.status = 'failed'
        await record.save()
      } catch (databaseError) {
        console.error('Could not update email status:', databaseError.message)
      }
    }

    return res.status(500).json({
      message: 'Email sending failed. Check the server configuration and logs.'
    })
  }
})

app.get('/api/emails/history', async (req, res) => {
  try {
    const records = await EmailRecord.find()
      .sort({ createdAt: -1 })
      .limit(100)

    res.json(records)
  } catch (error) {
    console.error('History error:', error.message)
    res.status(500).json({ message: 'could not fetch email history.' })
  }
})

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from the .env file.')
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected successfully')

    app.listen(PORT, () => {
      console.log(`Bulk Mail API running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error)
  }
}

startServer()