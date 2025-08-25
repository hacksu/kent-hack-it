// Function to show custom password popup and get result via callback
function showPasswordPrompt(callback) {
    // Create modal backdrop
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.tabIndex = -1;

    // Modal dialog container
    const modalDialog = document.createElement('div');
    modalDialog.className = 'modal-dialog modal-dialog-centered';

    // Modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    const modalTitle = document.createElement('h5');
    modalTitle.className = 'modal-title';
    modalTitle.innerText = 'Password Confirmation';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('aria-label', 'Close');

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);

    // Modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    const label = document.createElement('label');
    label.htmlFor = 'passwordInput';
    label.className = 'form-label';
    label.innerText = 'Enter your password to confirm:';

    const input = document.createElement('input');
    input.type = 'password';
    input.className = 'form-control';
    input.id = 'passwordInput';

    modalBody.appendChild(label);
    modalBody.appendChild(input);

    // Modal footer with buttons
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.innerText = 'Cancel';

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'btn btn-primary';
    confirmBtn.innerText = 'Confirm';

    modalFooter.appendChild(cancelBtn);
    modalFooter.appendChild(confirmBtn);

    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
    document.body.appendChild(modal);

    input.focus();

    // Event handlers
    confirmBtn.onclick = () => {
      const val = input.value;
      cleanup();
      callback(val);
    };

    cancelBtn.onclick = () => {
      cleanup();
      callback(null);
    };

    closeButton.onclick = () => {
      cleanup();
      callback(null);
    };

    // Clicking backdrop closes modal
    modal.onclick = (e) => {
      if (e.target === modal) {
        cleanup();
        callback(null);
      }
    };

    function cleanup() {
      document.body.removeChild(modal);
    }
}

export default showPasswordPrompt;