# QP Experiment 1: Qualitative Responses to HLL/LLL Responses

Change the condition by changing the `LATIN_COND` variable in `experiment.js`.

Sound files not available on github (intending on adding to OSF later)

## Custom jsPsych plugins

The `jspsych-audio-buttons.js` file is a custom jsPsych plugin I've written. It plays an audio stimulus but also provides multiple buttons that the participant can click on. There's also a text box and a likert scale with which to provide responses. This is essentially blending together the audio-text and likert-scale plugins from jsPsych, but also adding buttons that play audio. The audio playing utilizes jsPsych's audio stream so it can take advantage of the preloader. Plugin tracks the number of times each button is clicked, and each button can be made required to be clicked.

The `jspsych-quiz.js` file is another plugin based on the survey-multi-choice plugin. Essentially it lets you make a series of multiple choice questions, but there's an additional `correct` parameter for each question where you can set which answer (in `options`) is the correct answer by specifying its index. There's also an `alert_incorrect` parameter that has different options to set what kind of feedback you want to give the participant. 0 will provide no feedback, 1 will tell the participant that at least 1 answer is incorrect, and 2 will tell the participant which specific questions are incorrect via an alert. I implement this in a while chunk that will keep looping through the instructions and the quiz until the participant answers everything correctly. See the implementation in `experiment.js` around line 130. Due to the nature of the while chunk, it will add additional rows of data each time a person has to take the quiz. So, you can use this to track their answers over time if you need that for some reason, but more importantly you might need to filter out some of the rows in post processing. Might add in an additional field that says incorrect/correct to make the filtering easier later...

Thanks to Hyoung Seok Kwon and Lisa Sullivan for their sound test.