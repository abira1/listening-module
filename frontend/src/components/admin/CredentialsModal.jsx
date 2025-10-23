import React, { useState } from 'react';
import { X, Copy, Download, Mail, Printer } from 'lucide-react';
import './CredentialsModal.css';

export function CredentialsModal({ credentials, onClose }) {
  const [copied, setCopied] = useState('');

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=400,width=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Student Credentials</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .credentials-card { 
              border: 2px solid #333; 
              padding: 30px; 
              max-width: 500px; 
              margin: 0 auto;
              text-align: center;
            }
            .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .field { margin: 15px 0; }
            .label { font-size: 12px; color: #666; }
            .value { font-size: 18px; font-weight: bold; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="credentials-card">
            <div class="header">IELTS Exam Platform</div>
            <div class="header">Student Credentials</div>
            
            <div class="field">
              <div class="label">Student Name</div>
              <div class="value">${credentials.name}</div>
            </div>
            
            <div class="field">
              <div class="label">Institute</div>
              <div class="value">${credentials.institute}</div>
            </div>
            
            <div class="field">
              <div class="label">User ID</div>
              <div class="value">${credentials.user_id}</div>
            </div>
            
            <div class="field">
              <div class="label">Registration Number</div>
              <div class="value">${credentials.registration_number}</div>
            </div>
            
            <div style="margin-top: 40px; font-size: 12px; color: #999;">
              Please keep these credentials safe. You will need them to login.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = () => {
    // Simple text file download as alternative to PDF
    const text = `
IELTS EXAM PLATFORM - STUDENT CREDENTIALS
==========================================

Student Name: ${credentials.name}
Institute: ${credentials.institute}
Email: ${credentials.email}
Mobile: ${credentials.mobile}

USER ID: ${credentials.user_id}
REGISTRATION NUMBER: ${credentials.registration_number}

==========================================
Please keep these credentials safe.
You will need them to login to the platform.
==========================================
    `;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `${credentials.user_id}_credentials.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendEmail = () => {
    const subject = 'Your IELTS Exam Platform Credentials';
    const body = `
Dear ${credentials.name},

Your account has been created on the IELTS Exam Platform.

Your Login Credentials:
User ID: ${credentials.user_id}
Registration Number: ${credentials.registration_number}

Please keep these credentials safe and do not share them with anyone.

Best regards,
IELTS Exam Platform Admin
    `;
    
    window.location.href = `mailto:${credentials.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content credentials-modal">
        <div className="modal-header">
          <h3>✅ Student Added Successfully!</h3>
          <button className="btn-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="credentials-display">
          <div className="student-info">
            <div className="info-row">
              <span className="label">Student Name:</span>
              <span className="value">{credentials.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Institute:</span>
              <span className="value">{credentials.institute}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{credentials.email}</span>
            </div>
            <div className="info-row">
              <span className="label">Mobile:</span>
              <span className="value">{credentials.mobile}</span>
            </div>
          </div>

          <div className="credentials-box">
            <div className="credential-item">
              <label>User ID</label>
              <div className="credential-value">
                <span>{credentials.user_id}</span>
                <button
                  className="btn-copy"
                  onClick={() => handleCopy(credentials.user_id, 'user_id')}
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                  {copied === 'user_id' && <span className="copied">Copied!</span>}
                </button>
              </div>
            </div>

            <div className="credential-item">
              <label>Registration Number</label>
              <div className="credential-value">
                <span>{credentials.registration_number}</span>
                <button
                  className="btn-copy"
                  onClick={() => handleCopy(credentials.registration_number, 'reg_number')}
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                  {copied === 'reg_number' && <span className="copied">Copied!</span>}
                </button>
              </div>
            </div>
          </div>

          <div className="warning-box">
            <p>⚠️ Please save these credentials. The student will need them to login.</p>
          </div>

          <div className="action-buttons">
            <button className="btn-action" onClick={handlePrint} title="Print">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="btn-action" onClick={handleDownloadPDF} title="Download">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button className="btn-action" onClick={handleSendEmail} title="Send Email">
              <Mail className="w-4 h-4" />
              Send Email
            </button>
          </div>

          <div className="modal-footer">
            <button className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CredentialsModal;

