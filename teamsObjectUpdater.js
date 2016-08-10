module.exports = {
  getTeams: function() {
    return teams;
  },
  initializeTeams: function (teamJsonData, routes, perTeamMessages, perMissionMessages, perStoryMessages) {
    dataToTeams(teamJsonData, perTeamMessages);
    // Validate dimensions first
    if (routes.length !== teams.length || routes[0].length !== teams[0].missions.length) {
      console.log('Error in injectRoutes: dimension mismatch.');
      return teams;
    }
    injectRoutes(routes, perMissionMessages, perStoryMessages);
    console.log(JSON.stringify(teams));
    return teams;
  },
  teamOnline: function (teamNum) {
    teamOnline(teamNum);
    return teams;
  },
  skipMission: function (teamNum) {
    skipMission(teamNum);
    return teams;
  },
  advanceMission: function (teamNum) {
    advanceMission(teamNum);
    return teams;
  },
  backMission: function (teamNum) {
    backMission(teamNum);
    return teams;
  },
  // Function that takes a string with team and code and validates the 
  // code and updates the team based on action needed.
  // Then we return a messaging object array as the response.
  // Expecting string in format of 'TEAM CODE' or 'B1\nWORD'
  checkCode: function (checkString) {
    console.log('Checking code');
    // Remove new lines from string and replace with space.
    checkString = checkString.replace(/\r?\n|\r/g,' ');
    // Split string based on space.
    var splitStrings = checkString.split(' ');
    if (splitStrings.length < 2) {
      // ERR, unexpected string
      return CHECK_FORMATERROR_MESSAGE;
    }
    var teamName = splitStrings[0].toUpperCase();
    var codeWord = splitStrings[1];

    var teamFound = false;
    for (var teamNum in teams) {
      if (teams[teamNum].teamName.toUpperCase() === teamName) {
        teamFound = true;
        break;
      }
    }
    if (teamFound !== true) {
      // ERR, no team found with teamName
      return CHECK_TEAMERROR_MESSAGE;
    }

    console.log(teamNum);
    var curMissionNum = teams[teamNum].currentMission;
    if (curMissionNum === -1) {
      // ERR, team is not on a mission
      return teams[teamNum].noMissionMessage;
    }

    console.log('Code word: ' + teams[teamNum].missions[curMissionNum].code);
    console.log('Input: ' + codeWord);

    // Case insensitve checking
    var correctCodeWord = teams[teamNum].missions[curMissionNum].code.toUpperCase();
    var enteredCodeWord = codeWord.toUpperCase();
    var skipWord = teams[teamNum].skipWord.toUpperCase();
    var onlineWord = 'online'.toUpperCase();

    if (teams[teamNum].status === 'offline') {
      if (onlineWord === enteredCodeWord) {
        // Code:Online, respond custom online message.
        teamOnline(teamNum);
        return combineMessages(teams[teamNum].teamOnlineMessage, teams[teamNum].missions[curMissionNum].clue);
      } else {
        // Still offline, respond custom help message.
        return teams[teamNum].offlineHelpMessage;
      }
    } else if (correctCodeWord === enteredCodeWord) {
      // Code:Correct, respond with next level text.
      advanceMission(teamNum);
      // New current mission
      curMissionNum = teams[teamNum].currentMission;
      if (curMissionNum === -1) {
        return teams[teamNum].finishMessage;
      } else {
        return teams[teamNum].missions[curMissionNum].clue;
      }
    } else if (skipWord === enteredCodeWord) {
      // Code:Skip, respond with message to help finish mission.
      skipMission(teamNum);
      return teams[teamNum].missions[curMissionNum].skipHint;
    } else {
      // Code:Incorrect, respond with inccorrect message.
      return teams[teamNum].missions[curMissionNum].incorrectCodeMessage;
    }

    // Unreachable
  }
};

const CHECK_FORMATERROR_MESSAGE = [
  {
    delay: 0,
    message: 'I don\'t understand the text you entered. Looks like it\'s in the wrong format. (TEAMID CODEWORD)'
  }
];
// [
//   {
//     delay: 0,
//     message: 'First message'
//   },
//   {
//     delay: 1500,
//     message: 'Delayed message'
//   }
// ]
// NOTES: Add these fields to each team. (All are messaging object arrays)
// formatErrorMessage
// teamNotFoundMessage
// noMissionMessage
// finishMessage
// teamOnlineMessage
// offlineHelpMessage
// missions[curMissionNum].clue
// missions[curMissionNum].skipHint
// missions[curMissionNum].incorrectCodeMessage
const CHECK_TEAMERROR_MESSAGE = [
  {
    delay: 0,
    message: 'I can\'t find which team you are a part of. Your text might be in the wrong format. (TEAMID CODEWORD) Make sure your TEAMID is correct.'
  }
];
const CHECK_MISSIONERROR_MESSAGE = 'Your unit is not on a mission.';

var teams = [];

function dataToTeams (data, perTeamMessages) {
  for (var teamNum in data.teams) {
    teams[teamNum] = {};
    teams[teamNum].teamName = data.teams[teamNum].name;
    teams[teamNum].status = 'offline';
    teams[teamNum].skipWord = 'skip';
    teams[teamNum].currentMission = -1;
    teams[teamNum].missions = [];
    for (var missionNum in data.missions) {
      teams[teamNum].missions[missionNum] = {};
      teams[teamNum].missions[missionNum].missionName = data.missions[missionNum].name;
      teams[teamNum].missions[missionNum].code = data.missions[missionNum].code;
      teams[teamNum].missions[missionNum].missionStatus = 'offline';
    }
    for (var messageKey in perTeamMessages) {
      teams[teamNum][messageKey] = perTeamMessages[messageKey];
    }
  }
}

function injectRoutes (routes, perMissionMessages, perStoryMessages) {
  console.log(perMissionMessages);
  for (var teamNum in teams) {
    var prevMissionNum = -1;
    var curMissionNum = routes[teamNum][0];
    teams[teamNum].currentMission = routes[teamNum][0];
    for (var missionNum = 1; missionNum < routes[teamNum].length; missionNum++) {
      teams[teamNum].missions[curMissionNum].next = routes[teamNum][missionNum];
      teams[teamNum].missions[curMissionNum].prev = prevMissionNum;
      teams[teamNum].missions[curMissionNum].clue = combineMessages(perStoryMessages[missionNum - 1].storyLine, perMissionMessages[curMissionNum].clue);
      teams[teamNum].missions[curMissionNum].skipHint = perMissionMessages[missionNum - 1].skipHint;
      teams[teamNum].missions[curMissionNum].incorrectCodeMessage = perStoryMessages[missionNum - 1].incorrectLine;
      prevMissionNum = curMissionNum;
      curMissionNum = routes[teamNum][missionNum];
    }
    teams[teamNum].missions[curMissionNum].next = -1;
    teams[teamNum].missions[curMissionNum].prev = prevMissionNum; // End
    teams[teamNum].missions[curMissionNum].clue = combineMessages(perStoryMessages[missionNum - 1].storyLine, perMissionMessages[curMissionNum].clue);
    teams[teamNum].missions[curMissionNum].skipHint = perMissionMessages[missionNum - 1].skipHint;
    teams[teamNum].missions[curMissionNum].incorrectCodeMessage = perStoryMessages[curMissionNum].incorrectLine;
  }
}

function combineMessages (messagesArray1, messagesArray2) {
  // Make copy before modifying delays.
  messagesArray2 = JSON.parse(JSON.stringify(messagesArray2));
  // Combine 1 append 2.
  const BUFFER = 1000;
  var additionalDelay = longestDelay(messagesArray1) + BUFFER;
  for (var messageNum in messagesArray2) {
    console.log(JSON.stringify(messagesArray2));
    console.log(messagesArray2[messageNum].delay);
    console.log(additionalDelay);
    messagesArray2[messageNum].delay += additionalDelay;
  }
  return messagesArray1.concat(messagesArray2);
}

function longestDelay (messagesArray) {
  var max = 0;
  console.log(JSON.stringify(messagesArray));
  for (var messageNum in messagesArray) {
    var delay = messagesArray[messageNum].delay;
    console.log(delay);
    if (delay > max) {
      max = delay;
    }
  }
  console.log(max);
  return max;
}

function teamOnline (teamNum) {
  var curMissionNum = teams[teamNum].currentMission;
  teams[teamNum].status = 'online';
  teams[teamNum].missions[curMissionNum].missionStatus = 'active';
  teams[teamNum].missions[curMissionNum].startTime = Date();
}

function skipMission (teamNum) {
  var curMissionNum = teams[teamNum].currentMission;
  if (curMissionNum === -1) {
    //console.log('Warning in skipMission: no mission!')
    return false;
  }
  if (teams[teamNum].missions[curMissionNum].missionStatus === 'skipped') {
    // Already skipped mission!
    return false;
  }
  teams[teamNum].missions[curMissionNum].missionStatus = 'skipped';
  return true;
}

function advanceMission (teamNum) {
  var curMissionNum = teams[teamNum].currentMission;
  if (curMissionNum === -1) {
    //console.log('Warning in advanceMission: no mission!')
    return false;
  }
  if (teams[teamNum].missions[curMissionNum].missionStatus === 'active') {
    teams[teamNum].missions[curMissionNum].missionStatus = 'completed';
  }
  teams[teamNum].currentMission = teams[teamNum].missions[curMissionNum].next;

  curMissionNum = teams[teamNum].currentMission;
  if (curMissionNum !== -1) {
    teams[teamNum].missions[curMissionNum].missionStatus = 'active';
    teams[teamNum].missions[curMissionNum].startTime = Date();
  }
  return true;
}

function backMission (teamNum) {
  var curMissionNum = teams[teamNum].currentMission;
  if (curMissionNum === -1) {
    return false;
  }
  var prevMissionNum = teams[teamNum].missions[curMissionNum].prev;
  if (prevMissionNum === -1) {
    return false;
  }
  teams[teamNum].missions[curMissionNum].missionStatus = 'offline';

  teams[teamNum].currentMission = prevMissionNum;
  teams[teamNum].missions[prevMissionNum].missionStatus = 'active';
  return true;
}
