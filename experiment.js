// Lets us save data
// function saveData(filename, filedata){
//     $.ajax({
//       type:'post',
//       cache: false,
//       url: 'save_data.php',
//       data: {filename: filename, filedata: filedata}
//     });
//   };

function saveToFirebase(code, filedata){
    var ref = firebase.database().ref('users/' + code).set(filedata);
}

var submit_block = {
    type: 'html-keyboard-response',
    stimulus: "<p></p>",
    trial_duration: 1,
    response_ends_trial: false,
    timing_post_trial: 0,
    on_finish: function() {
        saveToFirebase(subID, jsPsych.data.get().json());
    }
}


// Create our blank timeline
var exp_timeline = [];
var subID = undefined;

// Audio check
var welcome = {
    type: 'survey-text',
    questions: [{prompt: 'Thank you for participating in our experiment, please enter subject id.', required: true, rows:1}],
    choices: ['Continue'],
    on_finish: function() {
      console.log(jsPsych.data.get().last(1).values()[0].responses);
        subID = jsPsych.data.get().last(1).values()[0].responses.match(/:\"(.*)\"/)[1];
        // console.log(subID);
    }
};
exp_timeline.push(welcome)




// Display consent form held in external_page.html
var check_consent = function(elem) {
    if (document.getElementById('consent_checkbox').checked) {
      return true;
    }
    else {
      alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
      return false;
    }
    return false;
  };
  
  
// Create consent
var consent = {
type:'external-html',
url: "consent_form.html",
cont_btn: "start",
check_fn: check_consent
};

exp_timeline.push(consent);

/*
Volume calibration screen
-Text: Please set volume at a comfortable level (~50% volume),
    press button to test volume, and increase or lower the volume
    until the voice is loud enough to hear them clearly, but not
    so loud as to be painful.
-On press: play calibration.wav
 */
// var calibrate = {

// };

var instructions = {
    type: 'html-button-response',
    stimulus: '<p>You will be listening to a series of conversations between a man and a woman. In each conversation, a question will be posed, and the man will make some response to that question.</p>'+
      '<p>Your task is to determine if his response is acceptable given the conversation that the two people had leading up to it.</p>'+
      '<p>You will be given a scale from "Completely Unacceptable" to "Completely Acceptable" as well as two textboxes to expand upon why you think the man responded the way he did and how he might be feeling emotionally.</p>'+
      '<p>Each conversation is to be treated as completely independant from one trial to the next.</p>'+
      '<p>When you are ready to start, you may press the button below.</p>',
    choices: ['Ready to start']
  }
exp_timeline.push(instructions);

// These are the scale labels we want to use for the likert scale
var scale = ["Completely Unacceptable", "Somewhat Unacceptable", "Neutral", "Somewhat Acceptable", "Completely Acceptable"];


/*
This is the general container for each trial,
will play an audio file and display a likert scale with 2 text boxes
*/
var trial_1 = {
    type: 'audio-text-scale-response',
    stimulus: jsPsych.timelineVariable('aud_file'),
    scale_questions: [{prompt:'<p>How acceptable was this response given the conversation?</p>', labels: scale}],
    scale_width: 500,
    questions: [
        {
            prompt:'<p>What do you think was going through the speaker\'s mind when he responded?</p>',
            rows: 5
        },
        {
            prompt:'<p>How do you think the speaker feels?</p>',
            rows: 5
        }
    ],
    display_button: true,
    data: {block: 1}
  }

var trial_2 = {
    type: 'audio-text-scale-response',
    stimulus: jsPsych.timelineVariable('aud_file'),
    scale_questions: [{prompt:'<p>How acceptable was this response given the conversation?</p>', labels: scale}],
    scale_width: 500,
    questions: [
        {
            prompt:'<p>What do you think was going through the speaker\'s mind when he responded?</p>',
            rows: 5
        },
        {
            prompt:'<p>How do you think the speaker feels?</p>',
            rows: 5
        }
    ],
    display_button: true,
    data: {block: 2}
}
// exp_timeline.push(trial)


/*
This will be the stimuli that are read in from the csv
and randomized according to the order we generated
*/
var trial_stims = [
    {aud_file: 'sound/ex_1_nominated.wav'},
    {aud_file: 'sound/ex_2_amelia.WAV'},
    {aud_file: 'sound/ex_3_mangos.WAV'}
];

// Keep an array to pass to the preloader
var media_to_preload = trial_stims.map(el => {return el['aud_file']});

/* 
A function to randomize the order of our stimuli,
both blocks will use the same order of trials
so we'll create the order ourselves instead of
using the randomize_order feature.
*/
function randomize(item_num) {
    var ordering = [];
    for(var i = 0; i < item_num; i++){
        ordering.push(i)
    }
    ordering = jsPsych.randomization.shuffle(ordering);
    return(ordering)
};

function manual_shuffle(ordering, stims) {
    var new_stim_list = [];
    for(var i = 0; i < ordering.length; i++){
        new_stim_list.push(stims[ordering[i]]);
    }
    return(new_stim_list);
};

// Shuffle the stimuli
stim_order = randomize(3);
trial_stims = manual_shuffle(stim_order, trial_stims);
// console.log(stim_order);
// console.log(trial_stims);

// This is a pause between each block
var block_notice = {
    type: 'html-button-response',
    stimulus: '<p>You will now start the second block of trials.</p>'+
      '<p>Some of these might sound familiar, but remember that these are independent of any previous conversations.</p>',
    choices: ['Continue']
  };

/*
Here's where we link the trial template to the stimuli for each block
*/
var trial_loop_1 = {
    timeline : [trial_1],
    timeline_variables : trial_stims
};

var trial_loop_2 = {
    timeline : [trial_2],
    timeline_variables : trial_stims
};

exp_timeline.push(trial_loop_1);
exp_timeline.push(block_notice);
exp_timeline.push(trial_loop_2);

exp_timeline.push(submit_block);

// Displays at the end of the experiment, will change for better mturk integration later
var thanks = {
    type: 'html-keyboard-response',
    stimulus: '<p>You have reached the end of this experiment.</p>'+
      '<p>Press any key to complete the experiment. Thank you!</p>',
  }
exp_timeline.push(thanks)


jsPsych.init({
    timeline: exp_timeline,
    use_webaudio: false,
    preload_audio: media_to_preload,
    show_preload_progress_bar: true, // show preload progress bar
    on_finish: function() {
    //   saveData("experiment_data.csv", jsPsych.data.get().csv());
      jsPsych.data.displayData();
    },
    default_iti: 250
  });
