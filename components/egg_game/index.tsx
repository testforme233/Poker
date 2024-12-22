"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const EggGameManager = () => {
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState({});
  const [seating, setSeating] = useState({
    tables: [],
    unassigned: []
  });

  useEffect(() => {
    setSeating(prev => ({
      ...prev,
      unassigned: teams.filter(team => 
        !prev.tables.some(table => 
          table.eastWest?.id === team.id || 
          table.northSouth?.id === team.id
        )
      )
    }));
  }, [teams]);
  
  return (
    <Card className="container mx-auto p-4">
      <CardHeader>
        <CardTitle className="text-2xl">年会惯蛋比赛管理系统</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="teams">管理小组</TabsTrigger>
            <TabsTrigger value="seating">座位安排</TabsTrigger>
            <TabsTrigger value="scores">积分管理</TabsTrigger>
            <TabsTrigger value="leaderboard">排行榜</TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <TeamManagement teams={teams} setTeams={setTeams} />
          </TabsContent>

          <TabsContent value="seating">
            <SeatingArrangement 
              teams={teams} 
              seating={seating} 
              setSeating={setSeating} 
            />
          </TabsContent>

          <TabsContent value="scores">
            <ScoreManagement 
              teams={teams} 
              scores={scores} 
              setScores={setScores} 
            />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard 
              teams={teams} 
              scores={scores} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const TeamManagement = ({ teams, setTeams }) => {
  const [teamName, setTeamName] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');

  const addTeam = () => {
    if (teamName && player1 && player2) {
      setTeams([...teams, {
        id: Date.now(),
        name: teamName,
        players: [player1, player2]
      }]);
      setTeamName('');
      setPlayer1('');
      setPlayer2('');
    }
  };

  const removeTeam = (id) => {
    setTeams(teams.filter(team => team.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>添加新队伍</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="队伍名称"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="队员1"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="队员2"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={addTeam}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          添加队伍
        </button>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>队伍列表</CardTitle>
          </CardHeader>
          <CardContent>
            {teams.map(team => (
              <div key={team.id} className="flex items-center justify-between border p-2 mb-2 rounded bg-gray-50">
                <div>
                  <span className="font-bold">{team.name}</span>
                  <span className="mx-2">-</span>
                  <span>{team.players.join(', ')}</span>
                </div>
                <button
                  onClick={() => removeTeam(team.id)}
                  className="text-red-500"
                >
                  删除
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

const SeatingArrangement = ({ teams, seating, setSeating }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [rows, setRows] = useState(() => seating.tables.length > 0 
    ? Math.ceil(Math.sqrt(seating.tables.length)) 
    : 3
  );
  const [cols, setCols] = useState(() => seating.tables.length > 0
    ? Math.ceil(seating.tables.length / Math.ceil(Math.sqrt(seating.tables.length)))
    : 3
  );
  const [draggedTeam, setDraggedTeam] = useState(null);
  const [draggedPosition, setDraggedPosition] = useState(null);

  const generateTables = () => {
    const newTables = Array(rows * cols).fill(null).map(() => ({
      eastWest: null,
      northSouth: null
    }));
    setSeating({
      tables: newTables,
      unassigned: [...teams]
    });
  };

  const handleDragStart = (e, team, position = null) => {
    setDraggedTeam(team);
    setDraggedPosition(position);
    e.dataTransfer.setData('text/plain', team.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, tableIndex, position) => {
    e.preventDefault();
    if (!draggedTeam) return;

    const newTables = [...seating.tables];
    const newUnassigned = [...seating.unassigned];

    if (seating.unassigned.find(t => t.id === draggedTeam.id)) {
      newTables[tableIndex] = {
        ...newTables[tableIndex],
        [position]: draggedTeam
      };
      const index = newUnassigned.findIndex(t => t.id === draggedTeam.id);
      newUnassigned.splice(index, 1);
    } else {
      const oldTableIndex = newTables.findIndex(t => 
        t.eastWest?.id === draggedTeam.id || t.northSouth?.id === draggedTeam.id
      );
      
      if (oldTableIndex !== -1) {
        const oldPosition = newTables[oldTableIndex].eastWest?.id === draggedTeam.id ? 'eastWest' : 'northSouth';
        newTables[oldTableIndex] = {
          ...newTables[oldTableIndex],
          [oldPosition]: null
        };
        newTables[tableIndex] = {
          ...newTables[tableIndex],
          [position]: draggedTeam
        };
      }
    }

    setSeating({
      tables: newTables,
      unassigned: newUnassigned
    });
    setDraggedTeam(null);
    setDraggedPosition(null);
  };

  const handleRemoveFromTable = (tableIndex, position) => {
    const team = seating.tables[tableIndex][position];
    if (!team) return;

    const newTables = [...seating.tables];
    newTables[tableIndex] = {
      ...newTables[tableIndex],
      [position]: null
    };

    setSeating({
      tables: newTables,
      unassigned: [...seating.unassigned, team]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          座位安排
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-500 text-white px-4 py-2 rounded text-sm"
          >
            {showSettings ? '隐藏设置' : '显示设置'}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showSettings && (
          <Card className="mb-4">
            <CardContent className="flex gap-4 mt-2">
              <div className="flex items-center">
                <label className="mr-2">行数:</label>
                <input
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                  className="border p-2 w-20"
                  min="1"
                />
              </div>
              <div className="flex items-center">
                <label className="mr-2">列数:</label>
                <input
                  type="number"
                  value={cols}
                  onChange={(e) => setCols(parseInt(e.target.value))}
                  className="border p-2 w-20"
                  min="1"
                />
              </div>
              <button
                onClick={generateTables}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                生成座位
              </button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4" style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`
        }}>
          {seating.tables.map((table, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-4">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                  {index + 1}
                </div>
                
                <div 
                  className="border-b p-2 mb-2"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index, 'eastWest')}
                >
                  {table.eastWest ? (
                    <div className="relative">
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, table.eastWest, 'eastWest')}
                        className="cursor-move"
                      >
                        <div className="font-bold">东西方位</div>
                        <div>{table.eastWest.name}</div>
                        <div className="text-sm">{table.eastWest.players.join(', ')}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromTable(index, 'eastWest')}
                        className="absolute top-0 right-0 text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-400">东西方位（空）</div>
                  )}
                </div>
                
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index, 'northSouth')}
                >
                  {table.northSouth ? (
                    <div className="relative">
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, table.northSouth, 'northSouth')}
                        className="cursor-move"
                      >
                        <div className="font-bold">南北方位</div>
                        <div>{table.northSouth.name}</div>
                        <div className="text-sm">{table.northSouth.players.join(', ')}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromTable(index, 'northSouth')}
                        className="absolute top-0 right-0 text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-400">南北方位（空）</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>待分配队伍</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {seating.unassigned.map(team => (
              <div
                key={team.id}
                draggable
                onDragStart={(e) => handleDragStart(e, team)}
                className="border p-2 bg-white cursor-move rounded shadow-sm hover:shadow"
              >
                {team.name}
              </div>
            ))}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

const ScoreManagement = ({ teams, scores, setScores }) => {
  const [currentRound, setCurrentRound] = useState(() => {
    const maxRound = Math.max(0, ...Object.keys(scores).map(Number));
    return maxRound || 1;
  });
  
  const [roundScores, setRoundScores] = useState(() => ({
    ...scores[currentRound]
  }));

  useEffect(() => {
    setRoundScores(scores[currentRound] || {});
  }, [currentRound, scores]);

  const saveRoundScores = () => {
    setScores({
      ...scores,
      [currentRound]: roundScores
    });
  };

  const handleRoundChange = (round) => {
    saveRoundScores();
    setCurrentRound(round);
    setRoundScores(scores[round] || {});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>第 {currentRound} 轮得分记录</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <select 
            value={currentRound}
            onChange={(e) => handleRoundChange(Number(e.target.value))}
            className="border p-2 rounded"
          >
            {Array.from({ length: Math.max(currentRound, 1) }, (_, i) => i + 1).map(round => (
              <option key={round} value={round}>第 {round} 轮</option>
            ))}
          </select>
          <button
            onClick={() => {
              saveRoundScores();
              setCurrentRound(prev => prev + 1);
              setRoundScores({});
            }}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            添加新轮次
          </button>
        </div>

        <Card>
          <CardContent className="p-4">
            {teams.map(team => (
              <div key={team.id} className="flex items-center gap-4 mb-2">
                <span className="w-32">{team.name}</span>
                <input
                  type="number"
                  value={roundScores[team.id] || ''}
                  onChange={(e) => setRoundScores({
                    ...roundScores,
                    [team.id]: parseInt(e.target.value)
                  })}
                  className="border p-2 w-24 rounded"
                />
              </div>
            ))}

            <button
              onClick={saveRoundScores}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              保存本轮得分
            </button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

const Leaderboard = ({ teams, scores }) => {
  const [displayCount, setDisplayCount] = useState(5);

  const calculateTotalScores = () => {
    return teams.map(team => {
      const totalScore = Object.values(scores).reduce((sum, round) => (
        sum + (round[team.id] || 0)
      ), 0);
      
      const firstTwoRounds = [1, 2].map(round => 
        scores[round] ? (scores[round][team.id] || 0) : 0
      );

      return {
        ...team,
        totalScore,
        firstTwoRounds
      };
    }).sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, displayCount);
  };

  const getBackgroundColor = (index) => {
    switch(index) {
      case 0: return 'bg-yellow-100';
      case 1: return 'bg-gray-100';
      case 2: return 'bg-orange-100';
      default: return 'bg-white';
    }
  };

  const rankedTeams = calculateTotalScores();

  return (
    <Card>
      <CardHeader>
        <CardTitle>排行榜</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="mr-2">显示前</label>
          <input
            type="number"
            value={displayCount}
            onChange={(e) => setDisplayCount(parseInt(e.target.value))}
            className="border p-2 w-20 rounded"
            min="1"
          />
          <label className="ml-2">名</label>
        </div>

        <div className="space-y-2">
          {rankedTeams.map((team, index) => (
            <Card key={team.id} className={`${getBackgroundColor(index)} border`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold mr-4">第 {index + 1} 名</span>
                    <span>{team.name}</span>
                    <span className="mx-2">-</span>
                    <span>{team.players.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-bold">总分: {team.totalScore}</span>
                    <span className="mx-2">|</span>
                    <span>前两轮: {team.firstTwoRounds.join(', ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EggGameManager;