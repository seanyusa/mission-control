module.exports = {
  initializeTeams: function (teamJsonData, routes) {
    dataToTeams(teamJsonData);
    // Validate dimensions first
    if (routes.length !== teams.length || routes[0].length !== teams[0].missions.length) {
      console.log('Error in injectRoutes: dimension mismatch.');
      return teams;
    }
    injectRoutes(routes);
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
  // Then we return a string as the response.
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
    var teamName = splitStrings[0];
    var codeWord = splitStrings[1];

    var teamFound = false;
    for (var teamNum in teams) {
      if (teams[teamNum].teamName === teamName) {
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

    if (correctCodeWord === enteredCodeWord) {
      // Code:Correct, respond with next level text.
      advanceMission(teamNum);
      // New current mission
      curMissionNum = teams[teamNum].currentMission;
      return teams[teamNum].missions[curMissionNum].clue;
    } else if (skipWord === enteredCodeWord) {
      // Code:Skip, respond with message to help finish mission.
      skipMission(teamNum);
      return teams[teamNum].missions[curMissionNum].skipHint;
    } else if (onlineWord === enteredCodeWord) {
      // Code:Online, respond custom online message.
      teamOnline(teamNum);
      return teams[teamNum].teamOnlineMessage;
    } else {
      // Code:Incorrect, respond with inccorrect message.
      return teams[teamNum].incorrectCodeMessage;
    }

    // Unreachable
  }
};

const CHECK_FORMATERROR_MESSAGE = 'I don\'t understand the text you entered. Looks like it\'s in the wrong format. (TEAMID CODEWORD)';
const CHECK_TEAMERROR_MESSAGE = 'I can\'t find which unit you are a part of. Your text might be in the wrong format. (TEAMID CODEWORD) Make sure your TEAMID is correct.';
const CHECK_MISSIONERROR_MESSAGE = 'Your unit is not on a mission.';

var teams = [];

function dataToTeams (data) {
  for (var teamNum in data.teams) {
    teams[teamNum] = {};
    teams[teamNum].teamName = data.teams[teamNum].name;
    teams[teamNum].status = 'offline';
    teams[teamNum].currentMission = -1;
    teams[teamNum].missions = [];
    for (var missionNum in data.missions) {
      teams[teamNum].missions[missionNum] = {};
      teams[teamNum].missions[missionNum].missionName = data.missions[missionNum].name;
      teams[teamNum].missions[missionNum].code = data.missions[missionNum].code;
      teams[teamNum].missions[missionNum].missionStatus = 'offline';
    }
  }
}

function injectRoutes (routes) {
  for (var teamNum in teams) {
    var prevMissionNum = -1;
    var curMissionNum = routes[teamNum][0];
    teams[teamNum].currentMission = routes[teamNum][0];
    for (var missionNum = 1; missionNum < routes[teamNum].length; missionNum++) {
      teams[teamNum].missions[curMissionNum].next = routes[teamNum][missionNum];
      teams[teamNum].missions[curMissionNum].prev = prevMissionNum;
      prevMissionNum = curMissionNum;
      curMissionNum = routes[teamNum][missionNum];
    }
    teams[teamNum].missions[curMissionNum].next = -1;
    teams[teamNum].missions[curMissionNum].prev = prevMissionNum; // End
  }
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
