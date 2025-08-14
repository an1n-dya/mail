document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  if (document.querySelector('#email-detail-view')) {
    document.querySelector('#email-detail-view').style.display = 'none';
  }

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    if (emails.length === 0) {
      const noEmailsDiv = document.createElement('div');
      noEmailsDiv.style.textAlign = 'center';
      noEmailsDiv.style.color = '#666';
      noEmailsDiv.style.padding = '40px';
      noEmailsDiv.innerHTML = `<p>No emails in ${mailbox}.</p>`;
      document.querySelector('#emails-view').appendChild(noEmailsDiv);
      return;
    }

    emails.forEach(email => {
      const emailDiv = document.createElement('div');
      emailDiv.className = 'email-item';
      emailDiv.style.border = '1px solid #ccc';
      emailDiv.style.padding = '10px';
      emailDiv.style.margin = '5px 0';
      emailDiv.style.cursor = 'pointer';
      emailDiv.style.backgroundColor = email.read ? '#f5f5f5' : 'white';
      emailDiv.style.borderRadius = '5px';
      
      const truncatedSubject = email.subject.length > 50 ? 
        email.subject.substring(0, 50) + '...' : email.subject;
      
      emailDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: ${email.read ? 'normal' : 'bold'};">
              ${email.sender}
            </div>
            <div style="color: #666; font-size: 0.9em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${truncatedSubject}
            </div>
          </div>
          <div style="color: #666; font-size: 0.8em; margin-left: 10px; white-space: nowrap;">
            ${email.timestamp}
          </div>
        </div>
      `;

      emailDiv.addEventListener('click', () => view_email(email.id));
      
      document.querySelector('#emails-view').appendChild(emailDiv);
    });
  })
  .catch(error => {
    console.error('Error loading mailbox:', error);
    document.querySelector('#emails-view').innerHTML += '<p style="color: red;">Error loading emails.</p>';
  });
}

function send_email(event) {
  event.preventDefault();
  
  const recipients = document.querySelector('#compose-recipients').value.trim();
  const subject = document.querySelector('#compose-subject').value.trim();
  const body = document.querySelector('#compose-body').value.trim();

  if (!recipients) {
    alert('Please enter at least one recipient.');
    return;
  }

  const submitBtn = event.target.querySelector('input[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.value = 'Sending...';

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    submitBtn.disabled = false;
    submitBtn.value = 'Send';

    if (result.error) {
      alert(result.error);
    } else {
      alert('Email sent successfully!');
      load_mailbox('sent');
    }
  })
  .catch(error => {
    submitBtn.disabled = false;
    submitBtn.value = 'Send';
    
    console.error('Error sending email:', error);
    alert('Error sending email. Please try again.');
  });
}

function view_email(email_id) {
  let emailDetailView = document.querySelector('#email-detail-view');
  if (!emailDetailView) {
    emailDetailView = document.createElement('div');
    emailDetailView.id = 'email-detail-view';
    document.querySelector('body').appendChild(emailDetailView);
  }

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  emailDetailView.style.display = 'block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    if (email.error) {
      alert(email.error);
      return;
    }

    emailDetailView.innerHTML = `
      <div style="margin-bottom: 20px;">
        <button onclick="load_mailbox('inbox')" class="btn btn-sm btn-outline-primary">← Back to Inbox</button>
      </div>
      <div style="border: 1px solid #ccc; padding: 20px; background: white;">
        <h4>${email.subject}</h4>
        <div style="margin: 10px 0; color: #666;">
          <strong>From:</strong> ${email.sender}<br>
          <strong>To:</strong> ${email.recipients.join(', ')}<br>
          <strong>Timestamp:</strong> ${email.timestamp}
        </div>
        <div style="margin: 20px 0;">
          <button onclick="reply_email(${email.id})" class="btn btn-sm btn-primary">Reply</button>
          ${email.sender !== document.querySelector('h2').textContent ? 
            `<button onclick="toggle_archive(${email.id}, ${!email.archived})" class="btn btn-sm btn-secondary">
              ${email.archived ? 'Unarchive' : 'Archive'}
            </button>` : ''}
        </div>
        <hr>
        <div style="white-space: pre-wrap;">${email.body}</div>
      </div>
    `;

    if (!email.read) {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      });
    }
  })
  .catch(error => {
    console.error('Error loading email:', error);
    alert('Error loading email');
  });
}

function toggle_archive(email_id, archive) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: archive
    })
  })
  .then(() => {
    load_mailbox('inbox');
  })
  .catch(error => {
    console.error('Error toggling archive:', error);
    alert('Error updating email');
  });
}

function reply_email(email_id) {
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    if (email.error) {
      alert(email.error);
      return;
    }

    compose_email();

    document.querySelector('#compose-recipients').value = email.sender;
    
    let subject = email.subject;
    if (!subject.startsWith('Re: ')) {
      subject = 'Re: ' + subject;
    }
    document.querySelector('#compose-subject').value = subject;
    
    const replyBody = `\n\nOn ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
    document.querySelector('#compose-body').value = replyBody;
    
    const bodyField = document.querySelector('#compose-body');
    bodyField.focus();
    bodyField.setSelectionRange(0, 0);
  })
  .catch(error => {
    console.error('Error loading email for reply:', error);
    alert('Error loading email');
  });
}
