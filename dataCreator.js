module.exports = {
	dataToTeams: function (data) {
		var teams = [];
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
    return teams;
	},
	injectRoutes: function (teams, routes) {
    // Validate dimensions first
    if (routes.length != teams.length || routes[0].length != teams[0].missions.length) {
      console.log('Error in injectRoutes: dimension mismatch.');
      return teams;
    }
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
    console.log(JSON.stringify(teams));
    return teams;
  },
  initializeTeam: function (teams, teamNum) {
    var curMissionNum = teams[teamNum].currentMission;
    teams[teamNum].status = 'online';
    teams[teamNum].missions[curMissionNum].missionStatus = 'active';
    return teams;
  },
  skipMission: function (teams, teamNum) {
    var curMissionNum = teams[teamNum].currentMission;
    if (curMissionNum == -1) {
      console.log('Warning in skipMission: trying to advance but already at the end!')
      return teams;
    }
    teams[teamNum].missions[curMissionNum].missionStatus = 'skipped';
    teams[teamNum].currentMission = teams[teamNum].missions[curMissionNum].next;

    curMissionNum = teams[teamNum].currentMission;
    if (curMissionNum == -1) {
      console.log('Warning in skipMission: end')
      return teams;
    }
    teams[teamNum].missions[curMissionNum].missionStatus = 'active';
    return teams;
  },
  advanceMission: function (teams, teamNum) {
    var curMissionNum = teams[teamNum].currentMission;
    if (curMissionNum == -1) {
      console.log('Warning in advanceMission: trying to advance but already at the end!')
      return teams;
    }
    teams[teamNum].missions[curMissionNum].missionStatus = 'completed';
    teams[teamNum].currentMission = teams[teamNum].missions[curMissionNum].next;

    curMissionNum = teams[teamNum].currentMission;
    if (curMissionNum == -1) {
      console.log('Warning in advanceMission: end')
      return teams;
    }
    teams[teamNum].missions[curMissionNum].missionStatus = 'active';
    return teams;
  }
};