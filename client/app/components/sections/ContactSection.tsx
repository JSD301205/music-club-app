'use client';

import { FaMapMarkerAlt, FaEnvelope, FaUsers } from 'react-icons/fa';
import AnimatedSection from '../../components/layout/AnimatedSection';
import SocialIcon from '../../components/ui/SocialIcon';
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, EmailJSTemplateParams } from '../../config/emailjs';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Prepare template parameters
      const templateParams: EmailJSTemplateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: EMAILJS_CONFIG.TO_EMAIL,
      };

      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      // console.log('Email sent successfully:', result);
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while sending the message');
    }
  };

  return (
    <AnimatedSection id="contact" className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="section-heading">Get In Touch</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Have questions or want to join the club? Reach out to us using the contact form or through our contact information.
            </p>
            
            <div className="space-y-4 mb-8">
              {[
                { icon: <FaMapMarkerAlt size={20} />, title: 'Address', content: 'Music Room (D1 PEMS Block), IIITDM Kancheepuram, Vandalur-Kelambakkam Road, Chennai - 600127, Tamil Nadu, India' },
                { icon: <FaEnvelope size={20} />, title: 'Email', content: <a href="mailto:musicclub.iiitdm@gmail.com" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">musicclub.iiitdm@gmail.com</a> },
                { icon: <FaUsers size={20} />, title: 'Club Hours', content: <span>Monday - Friday: 6:00 PM - 11:00 PM<br />Saturday & Sunday: 9:00 AM - 11:00 PM</span> },
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full text-purple-600 dark:text-purple-300">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
              {status === 'success' && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}
              {status === 'error' && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                  {errorMessage}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="contact-input"
                  placeholder="How can we help you?"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="contact-input"
                  placeholder="Your message here..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AnimatedSection>    
  );
};

export default ContactSection;
