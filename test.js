var timeline = []

var pre_audio = {
    type: 'html-button-response',
    stimulus: 'Recent versions of Chrome require the user to interact with a page before it can play audio. '+
    'Clicking the button below counts as an interaction. Be aware of this when planning audio experiments if '+
    'you want the first trial to include audio.',
    choices: ['Continue']
  };

timeline.push(pre_audio);

var trial_1 = {
    type: 'audio-slider-response',
    stimulus: '../sound/ex_1_nominated.WAV',
    labels: ['Not Funny', 'Funny'],
    slider_width: 500,
    prompt: '<p>How funny is the joke?</p>'
  }

timeline.push(trial_1);

jsPsych.init({
    timeline: timeline,
    use_webaudio: true,
    on_finish: function() {
      jsPsych.data.displayData();
    },
    default_iti: 250
  });