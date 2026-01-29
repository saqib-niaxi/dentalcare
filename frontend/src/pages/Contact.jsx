import { useState } from 'react'
import Input, { Textarea } from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useNotification } from '../context/NotificationContext'
import AnimatedSection, { AnimatedChildren } from '../components/animations/AnimatedSection'
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText'
import PremiumCard from '../components/ui/PremiumCard'
import MagneticButton from '../components/ui/MagneticButton'

import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  MapIcon
} from '@heroicons/react/24/solid'

export default function Contact() {
  const { success, error } = useNotification()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    success('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', phone: '', message: '' })
    setLoading(false)
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate text-white py-24 md:py-32">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-luxury-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fadeUp">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Get In Touch</p>
          </AnimatedSection>
          <AnimatedHeading level={1} className="text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            Contact <GradientText>Us</GradientText>
          </AnimatedHeading>
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Get in touch with our team.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 md:py-32 bg-luxury-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <AnimatedSection animation="fadeUp">
                <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Contact Information</p>
                <h2 className="text-2xl font-bold text-luxury-black mb-8">Get in Touch</h2>
              </AnimatedSection>

              <AnimatedChildren
                animation="fadeRight"
                stagger={0.1}
                className="space-y-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <MapPinIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-luxury-black">Address</h3>
                    <p className="text-gray-600">123 Main Street, Gulshan-e-Iqbal, Karachi</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-green-50">
                    <PhoneIcon className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-luxury-black">Phone</h3>
                    <p className="text-gray-600">+92 320 2067666</p>
                    <p className="text-gray-600">Emergency: +92 300 6089947</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-red-50">
                    <EnvelopeIcon className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-luxury-black">Email</h3>
                    <p className="text-gray-600">info@ahmeddental.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-amber-50">
                    <ClockIcon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-luxury-black">Working Hours</h3>
                    <p className="text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 9:00 AM - 2:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </AnimatedChildren>

              {/* Map Placeholder */}
              <AnimatedSection animation="fadeUp" delay={0.4} className="mt-8">
                <div className="bg-gradient-to-br from-luxury-black to-luxury-charcoal rounded-2xl h-64 flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <MapIcon className="w-12 h-12 mx-auto mb-2 text-luxury-gold/50" />
                    <p className="text-luxury-gold/80">Map placeholder</p>
                    <p className="text-sm text-white/40">Google Maps integration</p>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Contact Form */}
            <AnimatedSection animation="fadeLeft" delay={0.2}>
              <PremiumCard className="bg-white" glow>
                <h2 className="text-2xl font-bold text-luxury-black mb-6">Send Us a Message</h2>

                <form onSubmit={handleSubmit}>
                  <Input
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+92 320 2067666"
                  />

                  <Textarea
                    label="Your Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={5}
                    required
                  />

                  <MagneticButton
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full"
                    magnetic={false}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </MagneticButton>
                </form>
              </PremiumCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Emergency */}
      <section className="py-16 bg-gradient-to-r from-accent to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Dental Emergency?</h2>
            <p className="text-lg text-white/90 mb-6">
              We're here for you. Call our emergency line for immediate assistance.
            </p>
            <MagneticButton
              href="tel:+923006089947"
              variant="glass"
              size="lg"
              className="!bg-white !text-accent hover:!bg-white/90"
            >
              +92 300 6089947
            </MagneticButton>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
