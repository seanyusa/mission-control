module.exports = {
	namesToTeams: function (names) {
		var teams = [];
		for (var teamNum in names.teams) {
			teams[teamNum] = {};
			teams[teamNum].teamName = names.teams[teamNum];
			teams[teamNum].status = 'offline';
			teams[teamNum].currentMission = -1;
			teams[teamNum].missions = [];
			for (var missionNum in names.missions) {
				teams[teamNum].missions[missionNum] = {};
				teams[teamNum].missions[missionNum].missionName = names.missions[missionNum];
				teams[teamNum].missions[missionNum].missionStatus = 'offline';
				teams[teamNum].missions[missionNum].next = -1;
			}
		}
		console.log(JSON.stringify(teams));
    return teams;
	},
	injectRoutes: function (teams, routes) {
    // Validate dimensions first
    if (routes.length != teams.length || routes[0].length != teams[0].missions.length) {
      console.log('Error in injectRoutes: dimension mismatch.');
      return teams;
    }
    for (var teamNum in teams) {
      var prevMissionNum = routes[teamNum][0];
      teams[teamNum].currentMission = routes[teamNum][0];
      for (var missionNum = 1; missionNum < routes[teamNum].length; missionNum++) {
        teams[teamNum].missions[prevMissionNum].next = routes[teamNum][missionNum];
        prevMissionNum = routes[teamNum][missionNum];
      }
      teams[teamNum].missions[prevMissionNum].next = -1; // End
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
    teams[teamNum].missions[curMissionNum].missionStatus = 'skipped';
    teams[teamNum].currentMission = teams[teamNum].missions[curMissionNum].next;

    curMissionNum = teams[teamNum].currentMission;
    teams[teamNum].missions[curMissionNum].missionStatus = 'active';
    return teams;
  },
  advanceMission: function (teams, teamNum) {
    var curMissionNum = teams[teamNum].currentMission;
    teams[teamNum].missions[curMissionNum].missionStatus = 'completed';
    teams[teamNum].currentMission = teams[teamNum].missions[curMissionNum].next;

    curMissionNum = teams[teamNum].currentMission;
    teams[teamNum].missions[curMissionNum].missionStatus = 'active';
    return teams;
  }
};