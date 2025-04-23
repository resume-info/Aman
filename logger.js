/**
 * Website Logger
 * Logs visitor information and stores it in localStorage with ability to download logs
 */

// Logger object to handle all logging operations
const Logger = {
    // Initialize the logger
    init: function() {
        // Create logs array in localStorage if it doesn't exist
        if (!localStorage.getItem('visitor_logs')) {
            localStorage.setItem('visitor_logs', JSON.stringify([]));
        }
    },

    // Add a log entry
    log: function(logData) {
        // Add timestamp if not present
        if (!logData.datetime) {
            logData.datetime = new Date().toISOString();
        }
        
        // Add to console for debugging
        console.log('Log Entry:', logData);
        
        // Get existing logs
        const logs = JSON.parse(localStorage.getItem('visitor_logs') || '[]');
        
        // Add new log
        logs.push(logData);
        
        // Save back to localStorage
        localStorage.setItem('visitor_logs', JSON.stringify(logs));
        
        // Send to server if possible (using the same FormSubmit endpoint)
        this.sendToServer(logData);
    },
    
    // Log visitor information
    logVisitor: function(page) {
        // Get visitor IP and location
        this.getVisitorInfo()
            .then(visitorInfo => {
                const logEntry = {
                    type: 'visitor',
                    page: page,
                    datetime: new Date().toISOString(),
                    ip: visitorInfo.ip,
                    location: `${visitorInfo.city}, ${visitorInfo.region}, ${visitorInfo.country_name}`,
                    userAgent: navigator.userAgent,
                    referrer: document.referrer || 'direct'
                };
                
                // Log the entry
                this.log(logEntry);
                
                // If we're on the contact page, populate the hidden fields
                if (page === 'contact') {
                    this.populateContactFormFields(visitorInfo);
                }
                
                // Return visitor info in case it's needed
                return visitorInfo;
            })
            .catch(error => {
                console.error('Error logging visitor:', error);
                // Log even without location data
                this.log({
                    type: 'visitor',
                    page: page,
                    datetime: new Date().toISOString(),
                    error: 'Failed to get visitor info',
                    userAgent: navigator.userAgent,
                    referrer: document.referrer || 'direct'
                });
            });
    },
    
    // Populate hidden form fields for the contact form
    populateContactFormFields: function(visitorInfo) {
        const ipField = document.getElementById('visitor_ip');
        const locationField = document.getElementById('visitor_location');
        
        if (ipField && locationField) {
            ipField.value = visitorInfo.ip;
            locationField.value = `${visitorInfo.city}, ${visitorInfo.region}, ${visitorInfo.country_name}`;
        }
    },
    
    // Log form submission
    logFormSubmission: function(formData) {
        // Get visitor info, then log form submission
        this.getVisitorInfo()
            .then(visitorInfo => {
                const logEntry = {
                    type: 'form_submission',
                    datetime: new Date().toISOString(),
                    ip: visitorInfo.ip,
                    location: `${visitorInfo.city}, ${visitorInfo.region}, ${visitorInfo.country_name}`,
                    formData: formData,
                    userAgent: navigator.userAgent
                };
                
                // Log the entry
                this.log(logEntry);
            })
            .catch(error => {
                console.error('Error logging form submission:', error);
                // Log even without location data
                this.log({
                    type: 'form_submission',
                    datetime: new Date().toISOString(),
                    error: 'Failed to get visitor info',
                    formData: formData,
                    userAgent: navigator.userAgent
                });
            });
    },
    
    // Get visitor information (IP and location)
    getVisitorInfo: function() {
        return fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                const visitorIP = data.ip;
                return fetch(`https://ipapi.co/${visitorIP}/json/`);
            })
            .then(response => response.json());
    },
    
    // Send log to server
    sendToServer: function(logData) {
        const loggingEndpoint = 'https://formsubmit.co/amanchauhan947196@gmail.com';
        fetch(loggingEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'log_entry',
                log_data: logData
            })
        }).catch(error => console.error('Error sending log to server:', error));
    },
    
    // Generate and download log file
    downloadLogs: function() {
        // Get all logs
        const logs = JSON.parse(localStorage.getItem('visitor_logs') || '[]');
        
        // Format logs as text
        let logText = '=== WEBSITE VISITOR LOGS ===\n\n';
        logs.forEach((log, index) => {
            logText += `[LOG #${index + 1}] ${log.datetime}\n`;
            logText += `Type: ${log.type}\n`;
            
            // Add other properties
            Object.keys(log).forEach(key => {
                if (key !== 'type' && key !== 'datetime') {
                    // Format objects
                    if (typeof log[key] === 'object' && log[key] !== null) {
                        logText += `${key}: ${JSON.stringify(log[key], null, 2)}\n`;
                    } else {
                        logText += `${key}: ${log[key]}\n`;
                    }
                }
            });
            
            logText += '\n---\n\n';
        });
        
        // Create blob and download link
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `website_logs_${new Date().toISOString().slice(0, 10)}.logs`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Clear logs (if needed)
    clearLogs: function() {
        localStorage.setItem('visitor_logs', JSON.stringify([]));
        console.log('Logs cleared');
    }
};

// Initialize the logger when this script loads
Logger.init(); 
