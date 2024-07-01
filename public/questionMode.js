import { languageInfo, funLanguageInfo, historicLanguageInfo, alienLanguageInfo } from './languagedata.js';

document.addEventListener('DOMContentLoaded', function() {
    const questions = [
        {
            title: "Selected category",
            type: "category",
            options: ["Modern Languages", "Historic Languages", "Alien Languages", "Fun Languages"]
        },
        {
            title: "Selected language",
            type: "language",
            options: [] // This will be populated based on the selected category
        },
        {
            title: "Enter the text you want to translate",
            type: "text"
        }
    ];

    let currentQuestionIndex = 0;
    let answers = {};

    const questionTitle = document.getElementById('questionTitle');
    const answerArea = document.getElementById('answerArea');
    const prevButton = document.getElementById('prevButton');
    
    const progressBar = document.getElementById('progressBar');
    const resultArea = document.getElementById('resultArea');
    const translationResult = document.getElementById('translationResult');
    const copyButton = document.getElementById('copyButton');
    const tweetButton = document.getElementById('twitterShareButton');

    function updateQuestion() {
        const question = questions[currentQuestionIndex];
        questionTitle.textContent = question.title;
        answerArea.innerHTML = '';

        updateSelectionSummary();

        switch (question.type) {
            case 'category':
            case 'language':
                question.options.forEach(option => {
                    const button = document.createElement('button');
                    button.textContent = option;
                    button.addEventListener('click', () => selectOption(option));
                    answerArea.appendChild(button);
                });
                break;
            case 'text':
                const textarea = document.createElement('textarea');
                textarea.id = 'translationInput';
                textarea.className = 'full-width';
                answerArea.appendChild(textarea);
                break;
        }

        updateProgressBar();
        updateNavigationButtons();
    }

    function updateSelectionSummary() {
        const summary = document.getElementById('selectionSummary');
        summary.innerHTML = '';
        for (let i = 0; i < currentQuestionIndex; i++) {
            const div = document.createElement('div');
            div.textContent = `${questions[i].title}: ${answers[questions[i].type]}`;
            summary.appendChild(div);
        }
    }

    function selectOption(option) {
        answers[questions[currentQuestionIndex].type] = option;
        if (currentQuestionIndex === 0) {
            updateLanguageOptions(option);
        }
        nextQuestion();
    }

    function updateLanguageOptions(category) {
        let languageSet;
        switch (category) {
            case 'Modern Languages':
                languageSet = languageInfo;
                break;
            case 'Historic Languages':
                languageSet = historicLanguageInfo;
                break;
            case 'Alien Languages':
                languageSet = alienLanguageInfo;
                break;
            case 'Fun Languages':
                languageSet = funLanguageInfo;
                break;
        }
        questions[1].options = Object.keys(languageSet);
    }

    function nextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            updateQuestion();
        } else {
            showResult();
        }
    }

    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            updateQuestion();
        }
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function updateNavigationButtons() {
        prevButton.style.display = currentQuestionIndex === 0 ? 'none' : 'inline-block';
        if (currentQuestionIndex === questions.length - 1) {
          const translateButton = document.createElement('button');
          translateButton.id = 'translateButton';
          translateButton.textContent = 'Translate';
          translateButton.addEventListener('click', showResult);
       
          document.getElementById('navigationButtons').appendChild(translateButton);
        } else {
          const existingTranslateButton = document.getElementById('translateButton');
          if (existingTranslateButton) {
            existingTranslateButton.remove();
          }
        }
      }

    async function showResult() {
        const translateButton = document.getElementById('translateButton');
        translateButton.disabled = true;
        translateButton.style.opacity = '0.1';
        const textToTranslate = document.getElementById('translationInput').value;
        const userInput = document.getElementById('translationInput').value;
        document.getElementById('userInput').textContent = `Original submission: ${userInput}`;
        answers.text = textToTranslate;


        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: answers.text,
                    targetLanguage: answers.language
                }),
            });

            if (!response.ok) {
                throw new Error('Translation failed');
            }

            const data = await response.json();
            translationResult.textContent = data.result;
            resultArea.style.display = 'block';
            document.getElementById('questionContent').style.display = 'none';
            document.getElementById('navigationButtons').style.display = 'none';

            const completedMessage = document.createElement('p');
            completedMessage.textContent = 'Translation completed!';
            completedMessage.style.color = '#4CAF50';
            completedMessage.style.fontWeight = 'bold';
            document.getElementById('selectionSummary').appendChild(completedMessage);
            
        } catch (error) {
            console.error('Error during translation:', error);
            translationResult.textContent = 'An error occurred during translation.';
        }
    }

  
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(translationResult.textContent)
            .then(() => alert('Copied to clipboard!'))
            .catch(err => console.error('Failed to copy: ', err));
    });

    tweetButton.addEventListener('click', () => {
 
        const tweetText = encodeURIComponent(`Check out this translation: ${translationResult.textContent}`);
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    });

    const homeLink = document.createElement('a');
    homeLink.href = 'https://www.speakallai.com/';
    homeLink.textContent = 'Back to Home';
    homeLink.className = 'home-link';
    resultArea.appendChild(homeLink);
 
    const refreshLink = document.createElement('a');
refreshLink.href = 'questionMode.html'; // This will reload the question mode page
refreshLink.textContent = 'Refresh';
refreshLink.className = 'refresh-link';
resultArea.appendChild(refreshLink);
    
    prevButton.addEventListener('click', prevQuestion);
   

    // Initialize the question mode
    updateQuestion();
});