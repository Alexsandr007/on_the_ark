

document.addEventListener('DOMContentLoaded', function() {
    // Показываем поля голосования если они заполнены
    const pollQuestion = document.getElementById('poll_question');
    const pollOptions = document.getElementById('poll_options');
    
    if (pollQuestion && pollQuestion.value) {
        pollQuestion.style.display = 'block';
        pollOptions.style.display = 'block';
    }
    
    // Инициализация календаря с существующей датой
    const scheduledAt = document.getElementById('selectedDate').value;
    if (scheduledAt) {
        // Ваш код для установки даты в календаре
        console.log('Existing scheduled date:', scheduledAt);
    }
});
