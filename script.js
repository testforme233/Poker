document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const addGroupButton = document.getElementById('add-group');
  const groupList = document.getElementById('group-list');
  const generateTablesButton = document.getElementById('generate-tables');
  const tableContainer = document.getElementById('table-container');
  const roundContainer = document.getElementById('round-container');
   const nextRoundButton = document.getElementById('next-round');
  const topTeamsCountInput = document.getElementById('top-teams-count');
  const updateRankingButton = document.getElementById('update-ranking');
  const rankingBody = document.getElementById('ranking-body');

  let groups = [];
  let tables = [];
  let currentRound = 0;
  let matchHistory = [];
  let scoreRecord = [];

  // 初始化
  function init(){
    const savedGroups = localStorage.getItem("groups");
    if(savedGroups){
      groups = JSON.parse(savedGroups);
      renderGroups();
    }

    const savedTables = localStorage.getItem("tables");
    if(savedTables){
      tables = JSON.parse(savedTables);
      renderTables();
    }
    const savedMatchHistory = localStorage.getItem("matchHistory");
    if(savedMatchHistory){
      matchHistory = JSON.parse(savedMatchHistory);
    }
    const savedScoreRecord = localStorage.getItem("scoreRecord");
    if(savedScoreRecord){
      scoreRecord = JSON.parse(savedScoreRecord);
    }

    const savedCurrentRound = localStorage.getItem("currentRound");
    if(savedCurrentRound){
      currentRound = parseInt(savedCurrentRound);
    }
    if(currentRound > 0){
        renderRounds();
    }

    
  }
  init();


  // 切换标签页
  function activateTab(tabId) {
    tabContents.forEach(content => content.classList.remove('active'));
    tabs.forEach(tab => tab.classList.remove('active'));
    const tabContent = document.getElementById(tabId);
    const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
    tabContent.classList.add('active');
    tabButton.classList.add('active');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activateTab(tab.dataset.tab);
    });
  });


  // 小组管理
    addGroupButton.addEventListener('click', () => {
    groups.push({ id: Date.now(), name: '新小组', members: ['成员1', '成员2'] });
    renderGroups();
    updateLocalStorage();
  });

  function renderGroups() {
    groupList.innerHTML = '';
    groups.forEach(group => {
      const listItem = document.createElement('li');
      listItem.classList.add('group-item', 'flex', 'items-center','border', 'rounded','p-2');
      listItem.innerHTML = `
                <input type="text" value="${group.name}" data-group-id="${group.id}" class="group-name-input input input-sm input-bordered flex-1 mr-2">
                <input type="text" value="${group.members[0]}" data-member-index="0" data-group-id="${group.id}" class="group-member-input input input-sm input-bordered flex-1 mr-2">
                <input type="text" value="${group.members[1]}" data-member-index="1" data-group-id="${group.id}" class="group-member-input input input-sm input-bordered flex-1 mr-2">
                <button class="delete-group btn btn-error btn-xs" data-group-id="${group.id}">删除</button>
            `;
      groupList.appendChild(listItem);
    });

    attachGroupEventListeners();
  }

  function attachGroupEventListeners() {
    document.querySelectorAll('.group-name-input').forEach(input => {
      input.addEventListener('change', (event) => {
        const groupId = parseInt(event.target.dataset.groupId);
        const group = groups.find(group => group.id === groupId);
        if(group){
          group.name = event.target.value;
        }
        updateLocalStorage();
      });
    });

    document.querySelectorAll('.group-member-input').forEach(input => {
      input.addEventListener('change', (event) => {
        const groupId = parseInt(event.target.dataset.groupId);
        const memberIndex = parseInt(event.target.dataset.memberIndex);
        const group = groups.find(group => group.id === groupId);
        if(group){
          group.members[memberIndex] = event.target.value;
        }
        updateLocalStorage();
      });
    });

    document.querySelectorAll('.delete-group').forEach(button => {
      button.addEventListener('click', (event) => {
        const groupId = parseInt(event.target.dataset.groupId);
        groups = groups.filter(group => group.id !== groupId);
        renderGroups();
        updateLocalStorage();
      });
    });

    makeGroupsDraggable();
  }

    //  生成桌子
    generateTablesButton.addEventListener('click', () => {
        const rows = parseInt(document.getElementById('table-rows').value);
        const cols = parseInt(document.getElementById('table-cols').value);
        tables = [];
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            tables.push({ id: `${i}-${j}`, teamSlots: [null,null] });
          }
        }
        renderTables();
        updateLocalStorage();
    });

    function renderTables() {
        tableContainer.innerHTML = '';
        const rows = parseInt(document.getElementById('table-rows').value);
        const cols = parseInt(document.getElementById('table-cols').value);
        tableContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        tables.forEach(table => {
            const tableDiv = document.createElement('div');
            tableDiv.classList.add('table', 'p-4', 'border','rounded','text-center');
            tableDiv.dataset.tableId = table.id;
            tableDiv.innerHTML = `
                <h3 class="font-bold mb-2">桌子 ${table.id}</h3>
                 <div class="team-slot ${table.teamSlots[0]?'filled':''} border rounded p-2 mb-2" data-slot-index="0" >${table.teamSlots[0]?getGroupName(table.teamSlots[0]):'空闲'}</div>
                <div class="team-slot ${table.teamSlots[1]?'filled':''} border rounded p-2" data-slot-index="1" >${table.teamSlots[1]?getGroupName(table.teamSlots[1]):'空闲'}</div>
                `;
            tableContainer.appendChild(tableDiv);
        });
        makeTablesDroppable();
        updateLocalStorage();
      }

    function makeTablesDroppable() {
      document.querySelectorAll('.table').forEach(table => {
        table.addEventListener('dragover', function(event){
          event.preventDefault();
           this.classList.add('drop-target');
        });
        table.addEventListener('dragleave', function(event){
          this.classList.remove('drop-target');
        });
        table.addEventListener('drop', function(event){
          event.preventDefault();
          const groupId = parseInt(event.dataTransfer.getData("group-id"));
          const tableId = event.currentTarget.dataset.tableId;
          const table = tables.find(table => table.id === tableId);
            if(table){
                if(!table.teamSlots[0]){
                  table.teamSlots[0] = groupId;
                } else if (!table.teamSlots[1]){
                  table.teamSlots[1] = groupId;
                }
            }
          
          this.classList.remove('drop-target');
          renderTables();
        })
    });
   
}
   function getGroupName(groupId){
    const group = groups.find(group => group.id === groupId);
    return group?group.name:"";
   }

    // 让小组可拖拽
    function makeGroupsDraggable(){
        document.querySelectorAll('.group-item').forEach(groupItem => {
            groupItem.setAttribute('draggable', true);
            groupItem.addEventListener('dragstart', (event) => {
                const groupId = event.target.querySelector('.group-name-input').dataset.groupId;
              event.dataTransfer.setData('group-id', groupId);
            });
        });
    }

    // 比赛轮次

    nextRoundButton.addEventListener('click', () => {
        currentRound++;
        const matches = generateMatches();
        renderRound(matches);
        updateLocalStorage();
    });

    function generateMatches() {
        const availableGroups = [...groups];
         const currentMatches = [];

        // 如果是第一轮，随机分组
        if (currentRound === 1) {
            const shuffledGroups = shuffleArray(availableGroups);
            while (shuffledGroups.length >= 2) {
                const group1 = shuffledGroups.shift();
                const group2 = shuffledGroups.shift();
                currentMatches.push({ group1: group1.id, group2: group2.id });
            }
             return currentMatches;
        } else { //瑞士轮
            const playedMatches = matchHistory.flat().map(match => [match.group1,match.group2]); //获取所有对战历史
             let unMatchedGroups = availableGroups.map(group => group.id);

              while (unMatchedGroups.length >= 2) {
                  let group1 = unMatchedGroups.shift();
                  let group2 = null;
                   for (let i=0;i < unMatchedGroups.length;i++){
                      let potentialMatch = [group1,unMatchedGroups[i]];
                      let isMatchExist = playedMatches.some(match => (match[0] === potentialMatch[0] && match[1] === potentialMatch[1]) || (match[0] === potentialMatch[1] && match[1] === potentialMatch[0]));
                      if(!isMatchExist){
                        group2 = unMatchedGroups.splice(i,1)[0];
                         break;
                      }
                   }
                    if(group2){
                      currentMatches.push({ group1: group1, group2: group2 });
                    } else{
                      unMatchedGroups.push(group1)
                    }
              }

              return currentMatches;

        }
    }

    function renderRound(matches) {
        const roundDiv = document.createElement('div');
        roundDiv.classList.add('round', 'border', 'rounded', 'p-4', 'mb-4');
        roundDiv.innerHTML = `<h3 class="font-bold mb-2">第 ${currentRound} 轮</h3>`;

         matchHistory.push(matches)

         const matchTable = document.createElement('table');
        matchTable.classList.add('table','table-zebra', 'w-full');
         matchTable.innerHTML = `<thead><tr><th>组1</th><th>组2</th><th>得分</th></tr></thead><tbody></tbody>`;
        const matchTableBody = matchTable.querySelector("tbody");
        
        matches.forEach((match,index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${getGroupName(match.group1)}</td>
            <td>${getGroupName(match.group2)}</td>
            <td><input type="number" data-round="${currentRound}" data-match="${index}"  data-group1="${match.group1}" data-group2="${match.group2}" class="score-input input input-bordered input-sm"></td>
          `;
          matchTableBody.appendChild(row);
        });

         roundDiv.appendChild(matchTable);
          roundContainer.appendChild(roundDiv);

          nextRoundButton.disabled = true;
         attachScoreInputListeners();
          renderRounds();
    }

    function renderRounds() {
        roundContainer.innerHTML = '';
        for (let i=1; i<= currentRound; i++){
          const roundDiv = document.createElement('div');
          roundDiv.classList.add('round', 'border', 'rounded', 'p-4', 'mb-4');
          roundDiv.innerHTML = `<h3 class="font-bold mb-2">第 ${i} 轮</h3>`;

           const matchTable = document.createElement('table');
            matchTable.classList.add('table','table-zebra','w-full');
            matchTable.innerHTML = `<thead><tr><th>组1</th><th>组2</th><th>得分</th></tr></thead><tbody></tbody>`;
           const matchTableBody = matchTable.querySelector("tbody");
            
            const matches = matchHistory[i-1];
             matches.forEach((match,index) => {
                const score = scoreRecord.find(s => s.round === i && s.match === index );
                const row = document.createElement("tr");
                row.innerHTML = `
                <td>${getGroupName(match.group1)}</td>
                <td>${getGroupName(match.group2)}</td>
                <td><input type="number" data-round="${i}" data-match="${index}"  data-group1="${match.group1}" data-group2="${match.group2}" class="score-input input input-bordered input-sm" value="${score?score.score:''}"></td>
                `;
                matchTableBody.appendChild(row);
            });

          roundDiv.appendChild(matchTable);
           roundContainer.appendChild(roundDiv);
        }
        attachScoreInputListeners();

    }

    function attachScoreInputListeners(){
       document.querySelectorAll('.score-input').forEach(input => {
          input.addEventListener('change', (event) => {
            const round = parseInt(event.target.dataset.round);
             const match = parseInt(event.target.dataset.match);
            const group1 = parseInt(event.target.dataset.group1);
            const group2 = parseInt(event.target.dataset.group2);
            const score = parseInt(event.target.value);

             const recordIndex = scoreRecord.findIndex(s => s.round === round && s.match === match);
            if(recordIndex > -1){
              scoreRecord[recordIndex].score = score
            } else {
              scoreRecord.push({round: round, match: match, group1:group1,group2:group2, score:score });
            }
             
              updateLocalStorage();
              checkAllScoresEntered()
          })
       })
    }

     function checkAllScoresEntered() {
         if(currentRound === 0) return;
        const currentRoundMatch = matchHistory[currentRound-1];
         const allScoresEntered = currentRoundMatch.every((match,index) => {
           return scoreRecord.some(s => s.round === currentRound && s.match === index)
         });
        nextRoundButton.disabled = !allScoresEntered;
      }
     
    //总积分榜
    updateRankingButton.addEventListener('click', () => {
        renderRanking();
        updateLocalStorage();
    });
    function calculateScores(groupId){
       let round1Score = 0;
      let round2Score = 0;

      scoreRecord.forEach(record => {
         if(record.round === 1){
            if(record.group1 === groupId || record.group2 === groupId) {
              round1Score = record.score
            }
         }
        if(record.round === 2){
            if(record.group1 === groupId || record.group2 === groupId) {
              round2Score = record.score
            }
         }
      });
       return {
        round1Score,
         round2Score,
         totalScore:round1Score + round2Score
       };
    }

    function renderRanking(){
      const topCount = parseInt(topTeamsCountInput.value);
         const scores = groups.map(group => {
              const {round1Score, round2Score,totalScore} = calculateScores(group.id)
             return {
                id:group.id,
                name: group.name,
                 members: group.members.join(','),
                round1Score,
                 round2Score,
                totalScore
            }
        });
        scores.sort((a, b) => b.totalScore - a.totalScore);
        rankingBody.innerHTML = "";

        for(let i = 0;i < scores.length; i++){
            const score = scores[i];
             const row = document.createElement("tr");
              if (i === 0) {
                 row.classList.add('bg-yellow-500','text-white');
                } else if (i === 1) {
                 row.classList.add('bg-gray-300');
                 } else if (i === 2) {
                    row.classList.add('bg-orange-700','text-white');
                 } else {
                   row.classList.add('bg-amber-700','text-white');
                 }
              if(i<topCount){
               row.innerHTML = `
                <td>${i+1}</td>
                <td>${score.name}</td>
                <td>${score.members}</td>
                <td>${score.round1Score}</td>
                 <td>${score.round2Score}</td>
                <td>${score.totalScore}</td>
            `;
              } else {
                  row.innerHTML = `
                <td>${i+1}</td>
                <td>${score.name}</td>
                <td>${score.members}</td>
               <td>--</td>
                 <td>--</td>
                <td>${score.totalScore}</td>
            `;
              }
              rankingBody.appendChild(row);
         }
    }
     // 洗牌数组
     function shuffleArray(array) {
          const newArray = [...array];
          for (let i = newArray.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
          }
          return newArray;
      }
  // 本地存储数据
    function updateLocalStorage(){
        localStorage.setItem("groups", JSON.stringify(groups));
        localStorage.setItem("tables", JSON.stringify(tables));
        localStorage.setItem("matchHistory",JSON.stringify(matchHistory));
        localStorage.setItem("scoreRecord",JSON.stringify(scoreRecord));
         localStorage.setItem("currentRound",JSON.stringify(currentRound));
    }
    //初始禁用下一轮
      checkAllScoresEntered()
});