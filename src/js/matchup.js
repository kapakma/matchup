(function () {
    "use strict";

    var playerInfoService = function() {

    };

    var matchupController = function($scope, $http, $q, URL, DAYS, NUM_DAYS, CATS, FIELDS, NEW_FIELDS, NUM_PLAYERS) {
        var total = {
            fga: 0,
            fgm: 0,
            fta: 0,
            ftm: 0,
            fg_pct: 0,
            ft_pct: 0,
            pts: 0,
            ast: 0,
            reb: 0,
            stl: 0,
            blk: 0,
            tov: 0,
            fg3m: 0
        };

        $scope.positions = ["PG", "SG", "SF", "PF", "C", "G", "F", "UTIL"];

        $http.jsonp(URL + "commonallplayers/?LeagueID=00&Season=2016-17&IsOnlyCurrentSeason=1&callback=JSON_CALLBACK").success(function(data) {
            console.log(data)            
            var players = [];
            for (var i = 0; i < data.resultSets[0].rowSet.length; i++) {
                var player = {id:data.resultSets[0].rowSet[i][0], name:data.resultSets[0].rowSet[i][1]}
                players.push(player)
            }
            $scope.players = players;
            
            var promises = [];
            angular.forEach($scope.players, function(value, index) {
                if (index < 10) {
                    var promise = $http.jsonp(URL + "commonplayerinfo/?LeagueID=00&SeasonType=Regular+Season&PlayerID=" + value.id + "&callback=JSON_CALLBACK").success(function(data2) {
                        value.position = data2.resultSets[0].rowSet[0][14];
                    });

                    promises.push(promise)
                }
                else {
                    value.position = "PG"
                }
            });
            
            $q.all(promises).then(function() {
            //    console.log($scope.players)
            })
        });


            $scope.matchup = {
                teams: []
            }

            for (var t = 0; t < 2; t++) {
                $scope.matchup.teams[t] = {
                    name: 'Team ' + (t + 1),
                    days: []
                };

                $scope.matchup.teams[t].total = angular.copy(total);

                for (var i = 0; i < NUM_DAYS; i++) {
                    $scope.matchup.teams[t].days[i] = {
                        dayOfWeek: DAYS[i%DAYS.length]
                    };
                    $scope.matchup.teams[t].days[i].players = [];

                    for (var j = 0; j < NUM_PLAYERS; j++) {
                        $scope.matchup.teams[t].days[i].players[j] = angular.copy(total);
                        $scope.matchup.teams[t].days[i].players[j].position = $scope.positions[j];
                    }

                    $scope.matchup.teams[t].days[i].total = angular.copy(total);
                }

                $scope.selectedPlayer = [];
                for (var i = 0; i < NUM_DAYS; i++) {
                    $scope.selectedPlayer[i] = [];
                }
            }
            
            $scope.getGreaterStyle = function(day, index, cat) {
                var team, opp;

                if (0 > day) {
                    team = $scope.matchup.teams[index],
                    opp = $scope.matchup.teams[(0 === index ? 1 : 0)];
                }
                else {
                    team = $scope.matchup.teams[index].days[day],
                    opp = $scope.matchup.teams[(0 === index ? 1 : 0)].days[day];
                }

                if (team.total[cat] > opp.total[cat]) {
                    return {"color": "#337ab7"};
                }
                else if (team.total[cat] < opp.total[cat]) {
                    return {"color": "red"};
                }
            }

            $scope.getLesserStyle = function(day, index, cat) {
                var team, opp;

                if (0 > day) {
                    team = $scope.matchup.teams[index],
                    opp = $scope.matchup.teams[(0 === index ? 1 : 0)];
                }
                else {
                    team = $scope.matchup.teams[index].days[day],
                    opp = $scope.matchup.teams[(0 === index ? 1 : 0)].days[day];
                }

                if (team.total[cat] < opp.total[cat]) {
                    return {"color": "#337ab7"};
                }
                else if (team.total[cat] > opp.total[cat]) {
                    return {"color": "red"};
                }
            }

            $scope.currentDroplist = false;

            $scope.fillPlayer = function(userId, userName, t, d, p) {
                $("#" + t + '-' + d + '-' + p).val(userName);
                $scope.currentDroplist = false;
                if (0 == userId) { //if empty, reset
                    for (var i = 0; i < CATS.length; i++) {
                        $scope.matchup.teams[t].days[d].players[p][CATS[i]] = 0;
                    }
                }
                else {
                    $http.jsonp(URL + 'playerdashboardbylastngames/?PlayerID=' + userId + '&TeamId=0&MeasureType=Base&PerMode=PerGame&PlusMinus=N&PaceAdjust=N&Rank=N&LeagueId=00&Season=2016-17&SeasonType=Regular%20Season&PoRound=0&Outcome=&Location=&Month=0&SeasonSegment=&DateFrom&DateTo&OpponentTeamID=0&VsConference=&VsDivision=&GameSegment=&Period=0&LastNGames=0&callback=JSON_CALLBACK')
                        .success(function(response) {
                            console.log(response);
                            var rowSet = response.resultSets[$scope.lastN].rowSet[0];
                            for (var i = 0; i < CATS.length; i++) {
                                var cat = CATS[i];
                                $scope.matchup.teams[t].days[d].players[p][cat] = rowSet[NEW_FIELDS[cat.toUpperCase()]]
                            }
                        });
                    /*
                    $http.jsonp(URL + 'playercareerstats/?PlayerID=' + userId + '&PerMode=PerGame&callback=JSON_CALLBACK').success(function(response) {
                        var rowSet = response.resultSets[0].rowSet[response.resultSets[0].rowSet.length - 1];
                        for (var i = 0; i < CATS.length; i++) {
                            var cat = CATS[i];
                            $scope.matchup.teams[t].days[d].players[p][cat] = rowSet[FIELDS[cat.toUpperCase()]]
                        }
                    }, function(response) { 
                        console.log('error');
                    });
*/
                }
            };

            $scope.typeName = function(team, day, player) {
                $scope.currentDroplist = (team + '-' + day + '-' + player)
            };

            $scope.blurName = function(team, day, player) {
                if ($scope.currentDroplist == (team + '-' + day + '-' + player)) {
                    $scope.currentDroplist = false;
                }
            }

            $scope.updatePlayer = function(t, d, p) {
                var userId = $scope.selectedPlayer[t][d][p];
                console.log('user id: ' + userId);
                
                if (0 == userId) { //if empty, reset
                    for (var i = 0; i < CATS.length; i++) {
                        $scope.matchup.teams[t].days[d].players[p][CATS[i]] = 0;
                    }
                }
                else {
                    $http.jsonp(URL + 'playerdashboardbylastngames/?PlayerID=' + userId + '&TeamId=0&MeasureType=Base&PerMode=PerGame&PlusMinus=N&PaceAdjust=N&Rank=N&LeagueId=00&Season=2016-17&SeasonType=Regular%20Season&PoRound=0&Outcome=&Location=&Month=0&SeasonSegment=&DateFrom&DateTo&OpponentTeamID=0&VsConference=&VsDivision=&GameSegment=&Period=0&LastNGames=0&callback=JSON_CALLBACK')
                        .success(function(response) {
                            console.log(response);
                            var rowSet = response.resultSets[$scope.lastN].rowSet[0];
                            for (var i = 0; i < CATS.length; i++) {
                                var cat = CATS[i];
                                $scope.matchup.teams[t].days[d].players[p][cat] = rowSet[NEW_FIELDS[cat.toUpperCase()]]
                            }
                        });
                    /*
                    $http.jsonp(URL + 'playercareerstats/?PlayerID=' + userId + '&PerMode=PerGame&callback=JSON_CALLBACK').success(function(response) {
                        var rowSet = response.resultSets[0].rowSet[response.resultSets[0].rowSet.length - 1];
                        for (var i = 0; i < CATS.length; i++) {
                            var cat = CATS[i];
                            $scope.matchup.teams[t].days[d].players[p][cat] = rowSet[FIELDS[cat.toUpperCase()]]
                        }
                    }, function(response) { 
                        console.log('error');
                    });
*/
                }
            }

            $scope.selectLastN = function(selectedN) {
                $scope.lastN = selectedN;
            };

            $scope.lastN = 2;

            $scope.lastNDays = [
                {val:0, label:'All'},
                {val:1, label:'Last 5'},
                {val:2, label:'Last 10'},
                {val:3, label:'Last 15'},
                {val:4, label:'Last 20'}
            ];

            angular.forEach([0, 1], function(x, key) {
                for (var d = 0; d < NUM_DAYS; d++) {
                    $scope.$watch('matchup.teams[' + x + '].days[' + d + ']', function(newVal, oldVal) {
                        for (var i = 0; i < CATS.length; i++) {
                            newVal.total[CATS[i]] = 0;
                        }

                        //calculate day total
                        angular.forEach(newVal.players, function(value, index) {
                            for (var i = 0; i < CATS.length; i++) {
                                newVal.total[CATS[i]] += value[CATS[i]];
                            }
                        });
                        newVal.total['fg_pct'] = newVal.total['fgm']/newVal.total['fga'];
                        newVal.total['ft_pct'] = newVal.total['ftm']/newVal.total['fta'];

                        //calculate week total
                        for (var i = 0; i < CATS.length; i++) {
                            $scope.matchup.teams[x].total[CATS[i]] = 0;

                            for (var j = 0; j < NUM_DAYS; j++) {
                                $scope.matchup.teams[x].total[CATS[i]] += $scope.matchup.teams[x].days[j].total[CATS[i]];
                            }
                        }
                        $scope.matchup.teams[x].total['fg_pct'] = $scope.matchup.teams[x].total['fgm']/$scope.matchup.teams[x].total['fga'];
                        $scope.matchup.teams[x].total['ft_pct'] = $scope.matchup.teams[x].total['ftm']/$scope.matchup.teams[x].total['fta'];
                    }, true);
                }
            });
    };

    matchupController.$inject = ["$scope", "$http", "$q", "URL", "DAYS", "NUM_DAYS", "CATS", "FIELDS", "NEW_FIELDS", "NUM_PLAYERS"];

    angular.module("matchupApp", [])
        .constant("URL", "http://stats.nba.com/stats/")
        .constant("NUM_PLAYERS", 8)
        .constant("DAYS", ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
        .constant("NUM_DAYS", 7)
        .constant("CATS", [
            'fga',
            'fgm',
            'fta',
            'ftm',
            'fg_pct',
            'ft_pct',
            'pts',
            'ast',
            'reb',
            'stl',
            'blk',
            'tov',
            'fg3m'
        ])
        .constant("FIELDS", {
            "PLAYER_ID": 0,
            "SEASON_ID": 1,
            "LEAGUE_ID": 2,
            "TEAM_ID": 3,
            "TEAM_ABBREVIATION": 4,
            "PLAYER_AGE": 5,
            "GP": 6,
            "GS": 7,
            "MIN": 8,
            "FGM": 9,
            "FGA": 10,
            "FG_PCT": 11,
            "FG3M": 12,
            "FG3A": 13,
            "FG3_PCT": 14,
            "FTM": 15,
            "FTA": 16,
            "FT_PCT": 17,
            "OREB": 18,
            "DREB": 19,
            "REB": 20,
            "AST": 21,
            "STL": 22,
            "BLK": 23,
            "TOV": 24,
            "PF": 25,
            "PTS": 26
        })
        .constant("NEW_FIELDS", {
            "FGM": 7,
            "FGA": 8,
            "FG_PCT": 9,
            "FG3M": 10,
            "FG3A": 11,
            "FG3_PCT": 12,
            "FTM": 13,
            "FTA": 14,
            "FT_PCT": 15,
            "OREB": 16,
            "DREB": 17,
            "REB": 18,
            "AST": 19,
            "TOV": 20,            
            "STL": 21,
            "BLK": 22,
            "PF": 24,
            "PTS": 26
        })
        .controller("matchupCtrl", matchupController)
        .service("playerInfoService", playerInfoService)
        .filter('playerByPosition', function() {
            return function(items, position) {
                var filtered = [];/*
                console.log(position)
                angular.forEach(items, function(item) {
                    if (item.position.toLowerCase() == position) {
                        filtered.push(item);
                    }
                });
                */
                return filtered;
            }
        })
})();
