jsPsych.plugins['audio-text-scale-response'] = (function() {
  var plugin = {};
  
	jsPsych.pluginAPI.registerPreload('audio-text-scale-response', 'stimulus', 'audio');

  plugin.info = {
		name: 'audio-text-scale-response',
		description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      // The questions used for the likert scale
      scale_questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Scale Questions',
        nested: {
          prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Prompt',
            default: undefined,
            description: 'Questions that are associated with the slider.'
          },
          labels: {
            type: jsPsych.plugins.parameterType.STRING,
            array: true,
            pretty_name: 'Labels',
            default: undefined,
            description: 'Labels to display for individual question.'
          },
          required: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Required',
            default: false,
            description: 'Makes answering the question required.'
          },
          name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Question Name',
            default: '',
            description: 'Controls the name of data values associated with this question'
          }
        }
      },
      scale_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Scale width',
        default: null,
        description: 'Width of the likert scales in pixels.'
      },
      // The questions used for the text boxes
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        default: undefined,
        nested: {
          prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Prompt',
            default: undefined,
            description: 'Prompt for the subject to response'
          },
          placeholder: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Value',
            default: "",
            description: 'Placeholder text in the textfield.'
          },
          rows: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Rows',
            default: 1,
            description: 'The number of rows for the response text box.'
          },
          columns: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Columns',
            default: 40,
            description: 'The number of columns for the response text box.'
          },
          required: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Required',
            default: false,
            description: 'Require a response'
          },
          name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Question Name',
            default: '',
            description: 'Controls the name of data values associated with this question'
          }
        }
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
    display_button: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Button',
        default: false,
        description: 'Display the button or not'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'The text that appears on the button to finish the trial.'
      },
      randomize_question_order: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Randomize Question Order',
        default: false,
        description: 'If true, the order of the questions will be randomized'
      },
      randomize_scale_question_order: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Randomize Question Order',
        default: false,
        description: 'If true, the order of the questions will be randomized'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var start_trial_time = performance.now();

    // setup stimulus
    var context = jsPsych.pluginAPI.audioContext();
    if(context !== null){
      var source = context.createBufferSource();
      source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      source.connect(context.destination);
    } else {
      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      audio.currentTime = 0;
    }

    // set up end event if trial needs it
    if(trial.trial_ends_after_audio){
      if(context !== null){
        source.onended = function() {
          end_trial();
        }
      } else {
        audio.addEventListener('ended', end_trial);
      }
    }

    // change the scale width if specified
    if(trial.scale_width !== null){
        var w = trial.scale_width + 'px';
      } else {
        var w = '100%';
      }
  
      var html = "";
    
      // inject CSS for trial (for the likert scale)
      html += '<style id="jspsych-survey-likert-css">';
      html += ".jspsych-survey-likert-statement { display:block; font-size: 16px; padding-top: 40px; margin-bottom:10px; }"+
        ".jspsych-survey-likert-opts { list-style:none; width:"+w+"; margin:auto; padding:0 0 35px; display:block; font-size: 14px; line-height:1.1em; }"+
        ".jspsych-survey-likert-opt-label { line-height: 1.1em; color: #444; }"+
        ".jspsych-survey-likert-opts:before { content: ''; position:relative; top:11px; /*left:9.5%;*/ display:block; background-color:#efefef; height:4px; width:100%; }"+
        ".jspsych-survey-likert-opts:last-of-type { border-bottom: 0; }"+
        ".jspsych-survey-likert-opts li { display:inline-block; /*width:19%;*/ text-align:center; vertical-align: top; }"+
        ".jspsych-survey-likert-opts li input[type=radio] { display:block; position:relative; top:0; left:50%; margin-left:-6px; }"
      html += '</style>';
  
      // show preamble text
      if(trial.preamble !== null){
        html += '<div id="jspsych-survey-likert-preamble" class="jspsych-survey-likert-preamble">'+trial.preamble+'</div>';
      }
      html += '<form id="jspsych-survey-likert-form">';
  
      // add likert scale scale_questions ///
      // generate scale question order. this is randomized here as opposed to randomizing the order of trial.scale_questions
      // so that the data are always associated with the same question regardless of order
      var scale_question_order = [];
      for(var i=0; i<trial.scale_questions.length; i++){
        scale_question_order.push(i);
      }
      if(trial.randomize_question_order){
        scale_question_order = jsPsych.randomization.shuffle(question_order);
      }
      
      for (var i = 0; i < trial.scale_questions.length; i++) {
        var question = trial.scale_questions[scale_question_order[i]];
        // add scale question
        html += '<label class="jspsych-survey-likert-statement">' + question.prompt + '</label>';
        // add scale options
        var width = 100 / question.labels.length;
        var options_string = '<ul class="jspsych-survey-likert-opts" data-name="'+question.name+'" data-radio-group="Q' + scale_question_order[i] + '">';
        for (var j = 0; j < question.labels.length; j++) {
          options_string += '<li style="width:' + width + '%"><input type="radio" name="Q' + scale_question_order[i] + '" value="' + j + '"';
          if(question.required){
            options_string += ' required';
          }
          options_string += '><label class="jspsych-survey-likert-opt-label">' + question.labels[j] + '</label></li>';
        }
        options_string += '</ul>';
        html += options_string;
      }

      html += '</form>'

    // start survey text form
    html += '<form id="jspsych-survey-text-form" autocomplete="off">'

    // generate text question order
    var question_order = [];
    for(var i=0; i<trial.questions.length; i++){
      question_order.push(i);
    }
    if(trial.randomize_question_order){
      question_order = jsPsych.randomization.shuffle(question_order);
    }
    // add free response questions
    for (var i = 0; i < trial.questions.length; i++) {
      var question = trial.questions[question_order[i]];
      var question_index = question_order[i];
      html += '<div id="jspsych-survey-text-'+question_index+'" class="jspsych-survey-text-question" style="margin: 2em 0em;">';
      html += '<p class="jspsych-survey-text">' + question.prompt + '</p>';
      var autofocus = i == 0 ? "autofocus" : "";
      var req = question.required ? "required" : "";
      if(question.rows == 1){
        html += '<input type="text" id="input-'+question_index+'"  name="#jspsych-survey-text-response-' + question_index + '" data-name="'+question.name+'" size="'+question.columns+'" '+autofocus+' '+req+' placeholder="'+question.placeholder+'"></input>';
      } else {
        html += '<textarea id="input-'+question_index+'" name="#jspsych-survey-text-response-' + question_index + '" data-name="'+question.name+'" cols="' + question.columns + '" rows="' + question.rows + '" '+autofocus+' '+req+' placeholder="'+question.placeholder+'"></textarea>';
      }
      html += '</div>';
    }

    // add submit button
    if(trial.display_button){
        html += '<input type="submit" id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text" value="'+trial.button_label+'"></input>';
    }

    html += '</form>'

    // Display the html we've built for the trial
    display_element.innerHTML = html;

    var response = {
        rt: null,
        response: null
      };

    // backup in case autofocus doesn't work
    display_element.querySelector('#input-'+question_order[0]).focus();

    // Parse the responses
    display_element.querySelector('#jspsych-survey-text-form').addEventListener('submit', function(e) {
      e.preventDefault();

      // measure response time
      var end_trial_time = performance.now();
      var response_time = end_trial_time - start_trial_time;
      // create object to hold responses
      var question_data = {};

      // Parse the text responses
      for(var index=0; index < trial.questions.length; index++){
        var id = "Q" + index;
        var q_element = document.querySelector('#jspsych-survey-text-'+index).querySelector('textarea, input'); 
        var val = q_element.value;
        var name = q_element.attributes['data-name'].value;
        if(name == ''){
          name = id;
        }        
        var obje = {};
        obje[name] = val;
        Object.assign(question_data, obje);
      }

      var matches = display_element.querySelectorAll('#jspsych-survey-likert-form .jspsych-survey-likert-opts');

      // Parse the likert scale response
      for(var index = 0; index < matches.length; index++){
        var id = matches[index].dataset['radioGroup'];
        var el = display_element.querySelector('input[name="' + id + '"]:checked');
        if (el === null) {
          var resp = "";
        } else {
          var resp = parseInt(el.value);
        }
        var obje = {};
        if(matches[index].attributes['data-name'].value !== ''){
          var name = matches[index].attributes['data-name'].value;
        } else {
          var name = id;
        }
        obje['Acceptability'] = resp;
        Object.assign(question_data, obje);
      }
      
      // save data
      response.rt = response_time;
      response.response = JSON.stringify(question_data);

      display_element.innerHTML = '';

      //end the trail
      end_trial();

    });

  // End trial function
  function end_trial(){

    jsPsych.pluginAPI.clearAllTimeouts();

    if(context !== null){
      source.stop();
      source.onended = function() { }
    } else {
      audio.pause();
      audio.removeEventListener('ended', end_trial);
    };

    // save data
    var trialdata = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "response": response.response
        };

    display_element.innerHTML = '';

    // next trial
    jsPsych.finishTrial(trialdata);
  }

  var start_trial_time = performance.now();
  // start audio
  if(context !== null){
    startTime = context.currentTime;
    source.start(startTime);
  } else {
    audio.play();
  }

  // end trial if trial_duration is set
  if (trial.trial_duration !== null) {
    jsPsych.pluginAPI.setTimeout(function() {
      end_trial();
    }, trial.trial_duration);
  }
  
};

  return plugin;
})();