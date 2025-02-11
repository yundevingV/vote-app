// SPDX-License-Identifier: GPL-3.0

pragma solidity >= 0.7.0 < 0.9.0;

contract Vote {

    // 후보자 구조체
    struct candidate{
        string name;
        string imageHash;
        uint upVote;
    }

    // 변수
    bool live; 
    address owner;
    candidate[] public candidateList;

    // 한 번만 투표가능하도록
    mapping (address => bool) Voted;

    // 투표 이벤트
    event AddCandidate(string name);
    event DeleteCandidate(uint index);
    event UpVote (string candidate, uint upVote);
    event FinishVote(bool live);
    event Voting(address owner);

	//modifier
    modifier onlyOwner { // 투표를 종료할 사람은 운영자만 닫을 수 있다. 
        require(msg.sender == owner);
        _;
    }

    // constructor
    constructor() {
        owner = msg.sender;
        live = true;

        emit Voting(owner);
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner; 
    }

    function addCandidate(string memory _name, string memory _imageHash) public onlyOwner{
        require (live  == true ); // 투표가 진행중일때만 실행 
        require (candidateList.length < 5); // 후보자는 다섯명까지만
        
        candidateList.push(candidate(_name,_imageHash, 0)); // 후보자 이름과, 투표수 (후보자등록할대는 0표)를 리스트에 푸쉬

        // emit event 이벤트를 발생시킬땐 emit
        emit AddCandidate(_name); // 후보가 추가됨을 이벤트에 알림
    }
    
    function deleteCandidate(uint  _index) public onlyOwner {
        require(live == true);
        require(_index < candidateList.length);

        // 마지막 요소로 덮어쓰기
        candidateList[_index] = candidateList[candidateList.length - 1];
        candidateList.pop(); // 마지막 요소 제거

        emit DeleteCandidate(_index); // 후보가 삭제됨을 이벤트에 알림
    }

    // 투표
    function upVote(uint _index) public {
        require(live == true);
        require(_index < candidateList.length);
        require(Voted[msg.sender] == false);
        candidateList[_index].upVote++;

        Voted[msg.sender] = true;

        emit UpVote(candidateList[_index].name, candidateList[_index].upVote);
    }

    // 모든 후보자의 투표 결과를 반환하는 함수
    function getAllCandidates() public view returns (candidate[] memory) {
        return candidateList; // 후보자 리스트를 반환
    }
     
    // 총 투표수를 반환하는 함수
    function getTotalVotes() public view returns (uint256) {
        uint256 totalVotes = 0;

        // 모든 후보의 투표 수를 합산
        for (uint256 i = 0; i < candidateList.length; i++) {
            totalVotes += candidateList[i].upVote;
        }

        return totalVotes; // 총 투표 수 반환
    }

    // 투표 종료하기
    function finishVote() public {
        require (live  == true ); // 투표가 진행중이면 
        live = false;

        emit FinishVote(live);
    }

}