import React from 'react';
import { Mail, MessageCircle, Phone, HelpCircle } from 'lucide-react';

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  color: string;
}

export const SupportContact: React.FC = () => {
  const handleEmailSupport = () => {
    const subject = encodeURIComponent("Oil Palm AGS - Technical Support Request");
    const body = encodeURIComponent(`Hello Oil Palm AGS Support Team,

I need assistance with the following:

Issue Description:
[Please describe your issue here]

Steps I've tried:
[Please list what you've already attempted]

System Information:
- Browser: ${navigator.userAgent}
- Date: ${new Date().toLocaleDateString()}
- Time: ${new Date().toLocaleTimeString()}

Additional Details:
[Any other relevant information]

Thank you for your assistance.

Best regards,
[Your Name]`);

    // Open Gmail compose with pre-filled content
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=support@oilpalmags.com&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const handleChatSupport = () => {
    // This could integrate with a chat system like Intercom, Zendesk, etc.
    console.log("Opening chat support...");
    // For now, we'll just show an alert
    alert("Chat support will be available soon! Please use email support for now.");
  };

  const handlePhoneSupport = () => {
    // Open phone dialer or show phone number
    const phoneNumber = "+1-555-PALM-AGS";
    if (navigator.userAgent.match(/Mobile/)) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert(`Please call us at: ${phoneNumber}\n\nOffice Hours:\nMonday - Friday: 9:00 AM - 6:00 PM PST\nSaturday: 10:00 AM - 4:00 PM PST`);
    }
  };

  const handleFAQ = () => {
    // Navigate to FAQ section or open help docs
    window.open('/help', '_blank');
  };

  const supportOptions: SupportOption[] = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Get detailed help via email. We typically respond within 24 hours.',
      icon: Mail,
      action: handleEmailSupport,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time for immediate assistance.',
      icon: MessageCircle,
      action: handleChatSupport,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with our technical support specialists.',
      icon: Phone,
      action: handlePhoneSupport,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'faq',
      title: 'Help Center',
      description: 'Browse our comprehensive FAQ and documentation.',
      icon: HelpCircle,
      action: handleFAQ,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
          Need Help?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Our support team is here to help you get the most out of Oil Palm AGS. 
          Choose the option that works best for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportOptions.map((option) => (
          <div
            key={option.id}
            onClick={option.action}
            className="group cursor-pointer rounded-xl bg-white dark:bg-slate-800 p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <option.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  {option.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {option.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
        <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
          Emergency Agricultural Support
        </h3>
        <p className="text-emerald-700 dark:text-emerald-400 text-sm leading-relaxed">
          For urgent agricultural issues that may affect your crop yield, please call our emergency hotline: 
          <span className="font-semibold ml-1">+1-555-PALM-911</span>
          <br />
          Available 24/7 for critical agricultural emergencies.
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Need to report a bug or suggest a feature? 
          <button 
            onClick={handleEmailSupport}
            className="ml-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            Send us feedback
          </button>
        </p>
      </div>
    </div>
  );
};

export default SupportContact;
