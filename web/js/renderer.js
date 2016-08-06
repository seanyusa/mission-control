function renderJson(jsonData)
{
	var teams = JSON.parse(jsonData);
   	teamWidth = '19.5%';
	var teamTemplate = document.getElementById('team-template').innerHTML;
	Mustache.parse(teamTemplate);
	var missionTemplate = document.getElementById('mission-template').innerHTML;
	Mustache.parse(missionTemplate);

	var rendered = "";

	for (var teamNum in teams) {
		var missionTileContent = "";
		for (var i in teams[teamNum].missions) {
			missionTileContent += Mustache.render(missionTemplate, teams[teamNum].missions[i]);
		}
		
		teams[teamNum].missionArea = missionTileContent;
		teams[teamNum].teamWidth = teamWidth;

		rendered += Mustache.render(teamTemplate, teams[teamNum]);
	}

	return rendered;
}

function renderAdminJson(jsonData)
{
	var teams = JSON.parse(jsonData);
	var adminTeamTemplate = document.getElementById('admin-team-template').innerHTML;
	Mustache.parse(adminTeamTemplate);

	var rendered = "";

	for (var teamNum in teams) {
		console.log(teams[teamNum].currentMission);
		console.log(teams[teamNum].missions[teams[teamNum].currentMission]);
		var curMission = teams[teamNum].missions[teams[teamNum].currentMission];
		teams[teamNum].teamNum = teamNum;
		teams[teamNum].code = curMission ? curMission.code : 'NULL';
		teams[teamNum].prevMissionName = (curMission && curMission.prev != -1) ? teams[teamNum].missions[curMission.prev].missionName : 'NULL';
		teams[teamNum].curMissionName = curMission ? curMission.missionName : 'NULL';
		teams[teamNum].nextMissionName = (curMission && curMission.next != -1) ? teams[teamNum].missions[curMission.next].missionName : 'NULL';

		rendered += Mustache.render(adminTeamTemplate, teams[teamNum]);
	}

	return rendered;
}