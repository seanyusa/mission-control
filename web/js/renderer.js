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