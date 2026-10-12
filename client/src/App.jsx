import { useEffect, useState } from 'react'
import './App.css'


function App() {
  const [subject, setSubject] = useState('');
  const [recipients, setRecipients] = useState('');
  const [body, setBody] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/emails/history');
      if (!response.ok) {
        throw new Error('Failed to fetch email history');
      }
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching email history:', error);
    }
  };

  fetchHistory();
}, []);

  const handleSubmit = async(event) => {
    event.preventDefault();
    if(!subject.trim() || !recipients.trim() || !body.trim()){
      alert('Please fill in the subject, recipients, and email body.');
      return;
    }
    
    const recipientList = recipients
    .split(',')
    .map(email => email.trim())
    .filter(email => email !=='');


    const emailpattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(recipientList.some(email => !emailpattern.test(email))) {
      alert('please enter valid email addresses seperated by commas.');
      return;
    }

    try{
      const response = await fetch('http://localhost:5000/api/emails/send',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({
          subject,
          recipients: recipientList,
          body,
        }),
      });

      const data = await response.json();
      if(!response.ok){
        throw new Error(data.message || 'Failed to send email');
      }

      alert('Email sent successfully!');
      console.log(data);
    }catch(error){
      console.error('Error sending email:',error);
      alert(`Failed to send email: ${error.message}`);
    }
  };



  return (

    <div className='app-container'>
      <h1>Bulk Mail <span>App.</span></h1>
      <p className='app-description'>
        Send emails to multiple recipients with ease.
        Compose your message and reach your audience in seconds.
      </p>

      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='subject'>Email Subject</label>
          <input 
            type="text" 
            id="subject" 
            placeholder='Enter email subject'
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </div>

        <div className='form-group'>
          <label htmlFor='recipients'>Recipients</label>
          <input
            type="text"
            id="recipients"
            placeholder='Enter emails seperated by commas'
            value={recipients}
            onChange={(event) => setRecipients(event.target.value)}
          />
        </div>

        <div className='form-group'>
          <label htmlFor='body'>Email Message</label>
          <textarea
           id='body' 
           placeholder='Write your message here...'
           value={body}
           onChange={(event) => setBody(event.target.value)}
          ></textarea>
        </div>

        <button type='submit' className='send-button'>Send Email</button>
      </form>

            <section className="history-section">
        <h2>Email History</h2>

        {history.length === 0 ? (
          <p>No email history found.</p>
        ) : (
          history.map((email) => (
            <div key={email._id} className="history-item">
              <h3>{email.subject}</h3>
              <p><strong>Recipients:</strong> {email.recipients.join(', ')}</p>
              <p><strong>Status:</strong> {email.status}</p>
              <p><strong>Date:</strong> {new Date(email.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </section>
    </div>  

    
    
  )
}

export default App
