

document.addEventListener('DOMContentLoaded', function() {
    const pollQuestion = document.getElementById('poll_question');
    const pollOptions = document.getElementById('poll_options');
    
    if (pollQuestion && pollQuestion.value) {
        pollQuestion.style.display = 'block';
        pollOptions.style.display = 'block';
    }
    
    const scheduledAt = document.getElementById('selectedDate').value;
    if (scheduledAt) {
        console.log('Existing scheduled date:', scheduledAt);
    }
});
