import UserFriendsModel from "../../../src/models/user/UserFriendsModel.dto"
import UserProfileModel from "../../../src/models/user/UserProfileModel.dto"
import UserStatisticsModel from "../../../src/models/user/stats/UserStatisticsModel.dto"
import { PokerGameLogicController } from "../../../src/logic/poker/game/controller/PokerGameLogicController"
import { PokerGameStateUpdateController } from '../../../src/logic/poker/game/controller/PokerGameStateUpdateController'
import PokerGameCommandModel, { PokerGameCommandModelUtils } from '../../../src/models/poker/command/PokerGameCommandModel.dto'
import PokerGameCommandPlayerActionModel, { PokerGameCommandPlayerActionModelUtils } from '../../../src/models/poker/command/PokerGameCommandPlayerActionModel.dto'
import PokerGameCommandPlayerStatusUpdateModel from '../../../src/models/poker/command/PokerGameCommandPlayerStatusUpdateModel.dto'
import PokerGameCommandType from '../../../src/models/poker/command/PokerGameCommandType.dto'
import PokerGameModel from '../../../src/models/poker/PokerGameModel.dto'
import PokerPlayerActionType from '../../../src/models/poker/player/PokerPlayerActionType.dto'
import PokerPlayerModel from '../../../src/models/poker/player/PokerPlayerModel.dto'
import PokerPlayerMoneyUpdateModel from '../../../src/models/poker/player/PokerPlayerMoneyUpdateModel.dto'
import PokerPlayerStatusType from '../../../src/models/poker/player/PokerPlayerStatusType.dto'
import UserInfoModel from '../../../src/models/user/UserInfoModel.dto'
import PokerGameCommandStatusUpdateModel from "../../../src/models/poker/command/PokerGameCommandStatusUpdateModel.dto"
import PokerGameStatusModel from "../../../src/models/poker/PokerGameStatusModel.dto"
import PokerGameRoundType from "../../../src/models/poker/PokerGameRoundType.dto"
import PokerGameCommandStartModel from "../../../src/models/poker/command/PokerGameCommandStartModel.dto"
import PokerGameCommandRoundUpdateModel from "../../../src/models/poker/command/PokerGameCommandRoundUpdateModel.dto"

describe('Poker Flow tests', () =>
{
    let game: PokerGameModel
    let logicController: PokerGameLogicController
    let stateController: PokerGameStateUpdateController
    let commands = []
    const messageBus = { receiveCommand: (command) => { commands.push(command) }, receiveDealerCommand: (_) => {}, receivePlayerCommand: (_) => {}}

    beforeEach(() =>
    {
        game = new PokerGameModel()
        logicController = new PokerGameLogicController()
        stateController = new PokerGameStateUpdateController()
        commands = []
    })

    describe('error cases', () => {

        describe('BB early', () => {
            it('cannot play until button passes', async () => {
                //given
                let command : PokerGameCommandModel
                
                game.status.requiresManualStart = true
                game.players = [
                    createPlayer("a", 0, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("b", 1, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("c", 2, "1000", PokerPlayerStatusType.WAITING_TO_SIT),
                    createPlayer("d", 3, "1000", PokerPlayerStatusType.SITTING)
                ]
                game.players[2].isPayingBBEarly = true

                command = createCommand(PokerGameCommandType.STATUS_UPDATE, { statusUpdateCommand: new PokerGameCommandStatusUpdateModel(new PokerGameStatusModel(game.status.forcePaused, game.status.closed, false, game.status.hidden))})
                
                //when
                stateController.processCommand(game, command)
                logicController.processCommand(messageBus, game, command)
                
                //then
                expect(commands.length).toBe(2)
                expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
                expect(commands[1].type).toBe(PokerGameCommandType.ROUND_UPDATE)
                expect(commands[1].roundUpdateCommand).toEqual(new PokerGameCommandRoundUpdateModel(PokerGameRoundType.STARTING))


                //when
                commands.shift() //WAIT
                command = commands.shift()
                stateController.processCommand(game, command)
                logicController.processCommand(messageBus, game, command)

                //then
                expect(commands.length).toBe(2)
                expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
                expect(commands[1].type).toBe(PokerGameCommandType.START)
                expect(commands[1].startCommand).toEqual(new PokerGameCommandStartModel(1, 3, 0, [0,1,3]))
            })
            it('can play when BB Early becomes BB', async () => {
                //given
                let command : PokerGameCommandModel

                game.status.requiresManualStart = true
                game.players = [
                    createPlayer("a", 0, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("b", 1, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("c", 2, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("d", 3, "1000", PokerPlayerStatusType.WAITING_TO_SIT)
                ]
                game.players[3].isPayingBBEarly = true

                command = createCommand(PokerGameCommandType.STATUS_UPDATE, { statusUpdateCommand: new PokerGameCommandStatusUpdateModel(new PokerGameStatusModel(game.status.forcePaused, game.status.closed, false, game.status.hidden))})
                
                //when
                stateController.processCommand(game, command)
                logicController.processCommand(messageBus, game, command)
                
                //then
                expect(commands.length).toBe(2)
                expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
                expect(commands[1].type).toBe(PokerGameCommandType.ROUND_UPDATE)
                expect(commands[1].roundUpdateCommand).toEqual(new PokerGameCommandRoundUpdateModel(PokerGameRoundType.STARTING))


                //when
                commands.shift() //WAIT
                command = commands.shift()
                stateController.processCommand(game, command)
                logicController.processCommand(messageBus, game, command)

                //then
                expect(commands.length).toBe(2)
                expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
                expect(commands[1].type).toBe(PokerGameCommandType.START)
                expect(commands[1].startCommand).toEqual(new PokerGameCommandStartModel(1, 2, 3, [0,1,2,3]))
            })
            it('can play when button passes', async () => {
                //given
                let command : PokerGameCommandModel
                
                game.status.requiresManualStart = true
                game.players = [
                    createPlayer("a", 0, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("b", 1, "1000", PokerPlayerStatusType.WAITING_TO_SIT),
                    createPlayer("c", 2, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("d", 3, "1000", PokerPlayerStatusType.SITTING)
                ]
                game.players[1].isPayingBBEarly = true

                command = createCommand(PokerGameCommandType.STATUS_UPDATE, { statusUpdateCommand: new PokerGameCommandStatusUpdateModel(new PokerGameStatusModel(game.status.forcePaused, game.status.closed, false, game.status.hidden))})
                
                //when
                stateController.processCommand(game, command)
                logicController.processCommand(messageBus, game, command)
                
                //then
                expect(commands.length).toBe(2)
                expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
                expect(commands[1].type).toBe(PokerGameCommandType.ROUND_UPDATE)
                expect(commands[1].roundUpdateCommand).toEqual(new PokerGameCommandRoundUpdateModel(PokerGameRoundType.STARTING))


                //when
                commands.shift() //WAIT
                command = commands.shift()
                stateController.processCommand(game, command)
                logicController.processCommand(messageBus, game, command)

                //then
                expect(commands.length).toBe(2)
                expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
                expect(commands[1].type).toBe(PokerGameCommandType.START)
                expect(commands[1].startCommand).toEqual(new PokerGameCommandStartModel(2, 3, 0, [0,2,3,1]))
            })
            it('can play when button passes2', async () => {
                //given
                let command : PokerGameCommandModel
                
                game.status.requiresManualStart = true
                game.players = [
                    createPlayer("a", 0, "1000", PokerPlayerStatusType.WAITING_TO_SIT),
                    createPlayer("b", 1, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("c", 2, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("d", 3, "1000", PokerPlayerStatusType.SITTING)
                ]
                game.players[0].isPayingBBEarly = true

                command = createCommand(PokerGameCommandType.STATUS_UPDATE, { statusUpdateCommand: new PokerGameCommandStatusUpdateModel(new PokerGameStatusModel(game.status.forcePaused, game.status.closed, false, game.status.hidden))})
                
                //when
                stateController.processCommand(game, command)
                logicController.processCommand(messageBus, game, command)
                
                //then
                expect(commands.length).toBe(2)
                expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
                expect(commands[1].type).toBe(PokerGameCommandType.ROUND_UPDATE)
                expect(commands[1].roundUpdateCommand).toEqual(new PokerGameCommandRoundUpdateModel(PokerGameRoundType.STARTING))


                //when
                commands.shift() //WAIT
                command = commands.shift()
                stateController.processCommand(game, command)
                logicController.processCommand(messageBus, game, command)

                //then
                expect(commands.length).toBe(2)
                expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
                expect(commands[1].type).toBe(PokerGameCommandType.START)
                expect(commands[1].startCommand).toEqual(new PokerGameCommandStartModel(1, 2, 3, [1,2,3,0]))
            })
            it('can play when joining after BB and before button', async () => {
                //given
                let command : PokerGameCommandModel
                
                game.status.requiresManualStart = true
                game.players = [
                    createPlayer("a", 0, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("b", 1, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("c", 2, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("d", 3, "1000", PokerPlayerStatusType.SITTING),
                    createPlayer("e", 4, "1000", PokerPlayerStatusType.WAITING_TO_SIT)
                ]
                game.players[4].isPayingBBEarly = true

                command = createCommand(PokerGameCommandType.STATUS_UPDATE, { statusUpdateCommand: new PokerGameCommandStatusUpdateModel(new PokerGameStatusModel(game.status.forcePaused, game.status.closed, false, game.status.hidden))})
                
                //when
                stateController.processCommand(game, command)
                logicController.processCommand(messageBus, game, command)
                
                //then
                expect(commands.length).toBe(2)
                expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
                expect(commands[1].type).toBe(PokerGameCommandType.ROUND_UPDATE)
                expect(commands[1].roundUpdateCommand).toEqual(new PokerGameCommandRoundUpdateModel(PokerGameRoundType.STARTING))


                //when
                commands.shift() //WAIT
                command = commands.shift()
                stateController.processCommand(game, command)
                logicController.processCommand(messageBus, game, command)

                //then
                expect(commands.length).toBe(2)
                expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
                expect(commands[1].type).toBe(PokerGameCommandType.START)
                expect(commands[1].startCommand).toEqual(new PokerGameCommandStartModel(1, 2, 3, [0,1,2,3,4]))
            })
        })

        it('game should start after users joined with paying BB early', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.status.requiresManualStart = true
            game.players = [
                createPlayer("a", 0, "1000", PokerPlayerStatusType.WAITING_TO_SIT),
                createPlayer("b", 1, "1000", PokerPlayerStatusType.WAITING_TO_SIT),
                createPlayer("c", 2, "1000", PokerPlayerStatusType.WAITING_TO_SIT)
            ]
            game.players[0].isPayingBBEarly = true
            game.players[1].isPayingBBEarly = true
            game.players[2].isPayingBBEarly = true

            command = createCommand(PokerGameCommandType.STATUS_UPDATE, { statusUpdateCommand: new PokerGameCommandStatusUpdateModel(new PokerGameStatusModel(game.status.forcePaused, game.status.closed, false, game.status.hidden))})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.ROUND_UPDATE)
            expect(commands[1].roundUpdateCommand).toEqual(new PokerGameCommandRoundUpdateModel(PokerGameRoundType.STARTING))


            //when
            commands.shift() //WAIT
            command = commands.shift()
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)

            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.START)
            expect(commands[1].startCommand).toEqual(new PokerGameCommandStartModel(1, 2, 0, [0,1,2]))
        })
        it('game should start after users joined with paying BB early2', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.status.requiresManualStart = true
            game.players = [
                createPlayer("a", 0, "1000", PokerPlayerStatusType.WAITING_TO_SIT),
                createPlayer("b", 1, "1000", PokerPlayerStatusType.WAITING_TO_SIT),
                createPlayer("c", 2, "1000", PokerPlayerStatusType.WAITING_TO_SIT)
            ]
            game.players[0].isPayingBBEarly = true
            game.players[1].isPayingBBEarly = true

            command = createCommand(PokerGameCommandType.STATUS_UPDATE, { statusUpdateCommand: new PokerGameCommandStatusUpdateModel(new PokerGameStatusModel(game.status.forcePaused, game.status.closed, false, game.status.hidden))})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.ROUND_UPDATE)
            expect(commands[1].roundUpdateCommand).toEqual(new PokerGameCommandRoundUpdateModel(PokerGameRoundType.STARTING))


            //when
            commands.shift() //WAIT
            command = commands.shift()
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)

            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.START)
            expect(commands[1].startCommand).toEqual(new PokerGameCommandStartModel(1, 2, 0, [0,1,2]))
        })
        it('game should start after users joined with paying BB early3', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.status.requiresManualStart = true
            game.players = [
                createPlayer("a", 0, "1000", PokerPlayerStatusType.WAITING_TO_SIT),
                createPlayer("b", 1, "1000", PokerPlayerStatusType.WAITING_TO_SIT),
                createPlayer("c", 2, "1000", PokerPlayerStatusType.WAITING_TO_SIT)
            ]
            game.players[0].isPayingBBEarly = true

            command = createCommand(PokerGameCommandType.STATUS_UPDATE, { statusUpdateCommand: new PokerGameCommandStatusUpdateModel(new PokerGameStatusModel(game.status.forcePaused, game.status.closed, false, game.status.hidden))})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.ROUND_UPDATE)
            expect(commands[1].roundUpdateCommand).toEqual(new PokerGameCommandRoundUpdateModel(PokerGameRoundType.STARTING))


            //when
            commands.shift() //WAIT
            command = commands.shift()
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)

            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.START)
            expect(commands[1].startCommand).toEqual(new PokerGameCommandStartModel(1, 2, 0, [0,1,2]))
        })
        it('aggresive user should not be given an action after everyone folded', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.players = [
                createPlayer("a", 0, "1000"),
                createPlayer("b", 1, "1000", PokerPlayerStatusType.FOLDED),
                createPlayer("c", 2, "1000", PokerPlayerStatusType.FOLDED),
                createPlayer("d", 3, "1000")
            ]
            game.players[0].currentAction = PokerPlayerActionType.BET
            game.players[0].currentBetAmount = "1"
            game.turnData.playerActive = 3

            command = createCommand(PokerGameCommandType.PLAYER_ACTION, { playerActionCommand: PokerGameCommandPlayerActionModelUtils.Create(game, game.players[3], new PokerPlayerMoneyUpdateModel("d", 3, "1000"), PokerPlayerActionType.FOLD)})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.OVERBET_CLEANUP)
        })
        it('aggresive user should not be given an action after everyone folded + isWantingToSitOut', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.players = [
                createPlayer("a", 0, "1000"),
                createPlayer("b", 1, "1000", PokerPlayerStatusType.FOLDED),
                createPlayer("c", 2, "1000", PokerPlayerStatusType.FOLDED),
                createPlayer("d", 3, "1000")
            ]
            game.players[0].currentAction = PokerPlayerActionType.BET
            game.players[0].currentBetAmount = "1"
            game.turnData.playerActive = 3
            game.players[3].isWantingToSitOut = true

            command = createCommand(PokerGameCommandType.PLAYER_ACTION, { playerActionCommand: PokerGameCommandPlayerActionModelUtils.Create(game, game.players[3], new PokerPlayerMoneyUpdateModel("d", 3, "1000"), PokerPlayerActionType.FOLD)})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.OVERBET_CLEANUP)
        })
        it('aggresive user should not be given an action after everyone folded + sat out', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.players = [
                createPlayer("a", 0, "1000"),
                createPlayer("b", 1, "1000", PokerPlayerStatusType.SAT_OUT),
                createPlayer("c", 2, "1000", PokerPlayerStatusType.FOLDED),
                createPlayer("d", 3, "1000")
            ]
            game.players[0].currentAction = PokerPlayerActionType.BET
            game.players[0].currentBetAmount = "1"
            game.turnData.playerActive = 3

            command = createCommand(PokerGameCommandType.PLAYER_ACTION, { playerActionCommand: PokerGameCommandPlayerActionModelUtils.Create(game, game.players[3], new PokerPlayerMoneyUpdateModel("d", 3, "1000"), PokerPlayerActionType.FOLD)})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.OVERBET_CLEANUP)
        })
        it('aggresive user should not be given an action after everyone folded + isWantingToSitOut + sat out', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.players = [
                createPlayer("a", 0, "1000"),
                createPlayer("b", 1, "1000", PokerPlayerStatusType.SAT_OUT),
                createPlayer("c", 2, "1000", PokerPlayerStatusType.FOLDED),
                createPlayer("d", 3, "1000")
            ]
            game.players[0].currentAction = PokerPlayerActionType.BET
            game.players[0].currentBetAmount = "1"
            game.turnData.playerActive = 3
            game.players[3].isWantingToSitOut = true

            command = createCommand(PokerGameCommandType.PLAYER_ACTION, { playerActionCommand: PokerGameCommandPlayerActionModelUtils.Create(game, game.players[3], new PokerPlayerMoneyUpdateModel("d", 3, "1000"), PokerPlayerActionType.FOLD)})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.OVERBET_CLEANUP)
        })
        it('aggresive user should not be given an action after everyone folded or other', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.players = [
                createPlayer("a", 0, "1000"),
                createPlayer("b", 1, "1000", PokerPlayerStatusType.SAT_OUT),
                createPlayer("c", 2, "1000", PokerPlayerStatusType.FOLDED),
                createPlayer("d", 3, "1000", PokerPlayerStatusType.SITTING),
                createPlayer("e", 4, "1000", PokerPlayerStatusType.WAITING_TO_SIT),
                createPlayer("f", 5, "1000")
            ]
            game.players[0].currentAction = PokerPlayerActionType.BET
            game.players[0].currentBetAmount = "1"
            game.turnData.playerActive = 5

            command = createCommand(PokerGameCommandType.PLAYER_ACTION, { playerActionCommand: PokerGameCommandPlayerActionModelUtils.Create(game, game.players[5], new PokerPlayerMoneyUpdateModel("f", 5, "1000"), PokerPlayerActionType.FOLD)})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.OVERBET_CLEANUP)
        })
        it('aggresive user should not be given an action after everyone folded or other + isWantingToSitOut', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.players = [
                createPlayer("a", 0, "1000"),
                createPlayer("b", 1, "1000", PokerPlayerStatusType.SAT_OUT),
                createPlayer("c", 2, "1000", PokerPlayerStatusType.FOLDED),
                createPlayer("d", 3, "1000", PokerPlayerStatusType.SITTING),
                createPlayer("e", 4, "1000", PokerPlayerStatusType.WAITING_TO_SIT),
                createPlayer("f", 5, "1000")
            ]
            game.players[0].currentAction = PokerPlayerActionType.BET
            game.players[0].currentBetAmount = "1"
            game.turnData.playerActive = 5
            game.players[5].isWantingToSitOut = true

            command = createCommand(PokerGameCommandType.PLAYER_ACTION, { playerActionCommand: PokerGameCommandPlayerActionModelUtils.Create(game, game.players[5], new PokerPlayerMoneyUpdateModel("f", 5, "1000"), PokerPlayerActionType.FOLD)})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.OVERBET_CLEANUP)
        })

        it('first user should not be given an action after everyone checked', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.players = [
                createPlayer("a", 0, "1000"),
                createPlayer("b", 1, "1000"),
                createPlayer("c", 2, "1000"),
                createPlayer("d", 3, "1000")
            ]
            game.players[0].currentAction = PokerPlayerActionType.CHECK
            game.players[1].currentAction = PokerPlayerActionType.CHECK
            game.players[2].currentAction = PokerPlayerActionType.CHECK
            game.turnData.playerActive = 3

            command = createCommand(PokerGameCommandType.PLAYER_ACTION, { playerActionCommand: PokerGameCommandPlayerActionModelUtils.Create(game, game.players[3], new PokerPlayerMoneyUpdateModel("d", 3, "1000"), PokerPlayerActionType.CHECK)})            
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.OVERBET_CLEANUP)
        })

        it('aggresive user should not be given an action after everyone called', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.players = [
                createPlayer("a", 0, "1000"),
                createPlayer("b", 1, "1000"),
                createPlayer("c", 2, "1000"),
                createPlayer("d", 3, "1000")
            ]
            game.players[0].currentAction = PokerPlayerActionType.BET
            game.players[0].currentBetAmount = "1"
            game.players[1].currentAction = PokerPlayerActionType.CALL
            game.players[1].currentBetAmount = "1"
            game.players[2].currentAction = PokerPlayerActionType.CALL
            game.players[2].currentBetAmount = "1"
            game.turnData.playerActive = 3

            command = createCommand(PokerGameCommandType.PLAYER_ACTION, { playerActionCommand: PokerGameCommandPlayerActionModelUtils.Create(game, game.players[3], new PokerPlayerMoneyUpdateModel("d", 3, "999", "-1", "1"), PokerPlayerActionType.CALL)})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.OVERBET_CLEANUP)
        })
        it('aggresive user should not be given an action after everyone called + 1 all in', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.players = [
                createPlayer("a", 0, "1000"),
                createPlayer("b", 1, "1000"),
                createPlayer("c", 2, "0"),
                createPlayer("d", 3, "1000")
            ]
            game.players[0].currentAction = PokerPlayerActionType.BET
            game.players[0].currentBetAmount = "1"
            game.players[1].currentAction = PokerPlayerActionType.CALL
            game.players[1].currentBetAmount = "1"
            game.turnData.playerActive = 3

            command = createCommand(PokerGameCommandType.PLAYER_ACTION, { playerActionCommand: PokerGameCommandPlayerActionModelUtils.Create(game, game.players[3], new PokerPlayerMoneyUpdateModel("d", 3, "999", "-1", "1"), PokerPlayerActionType.CALL)})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.OVERBET_CLEANUP)
        })
        it('aggresive user should not be given an action after everyone called + 1 call all in this round', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.players = [
                createPlayer("a", 0, "1000"),
                createPlayer("b", 1, "1000"),
                createPlayer("c", 2, "0"),
                createPlayer("d", 3, "1000")
            ]
            game.players[0].currentAction = PokerPlayerActionType.BET
            game.players[0].currentBetAmount = "1"
            game.players[1].currentAction = PokerPlayerActionType.CALL
            game.players[1].currentBetAmount = "1"
            game.players[2].currentAction = PokerPlayerActionType.CALL
            game.players[2].currentBetAmount = "1"
            game.turnData.playerActive = 3

            command = createCommand(PokerGameCommandType.PLAYER_ACTION, { playerActionCommand: PokerGameCommandPlayerActionModelUtils.Create(game, game.players[3], new PokerPlayerMoneyUpdateModel("d", 3, "999", "-1", "1"), PokerPlayerActionType.CALL)})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.OVERBET_CLEANUP)
        })
        it('aggresive user should not be given an action after everyone called + 1 bet all in this round', async () => {
            //given
            let command : PokerGameCommandModel
            
            game.players = [
                createPlayer("a", 0, "1000"),
                createPlayer("b", 1, "1000"),
                createPlayer("c", 2, "0"),
                createPlayer("d", 3, "1000")
            ]
            game.players[0].currentAction = PokerPlayerActionType.BET
            game.players[0].currentBetAmount = "2"
            game.players[1].currentAction = PokerPlayerActionType.CALL
            game.players[1].currentBetAmount = "2"
            game.players[2].currentAction = PokerPlayerActionType.BET
            game.players[2].currentBetAmount = "1"
            game.turnData.playerActive = 3

            command = createCommand(PokerGameCommandType.PLAYER_ACTION, { playerActionCommand: PokerGameCommandPlayerActionModelUtils.Create(game, game.players[3], new PokerPlayerMoneyUpdateModel("d", 3, "998", "-2", "2"), PokerPlayerActionType.CALL)})
            
            //when
            stateController.processCommand(game, command)
            logicController.processCommand(messageBus, game, command)
            
            //then
            expect(commands.length).toBe(2)
            expect(commands[0].type).toBe(PokerGameCommandType.WAIT)
            expect(commands[1].type).toBe(PokerGameCommandType.OVERBET_CLEANUP)
        })
    })

    function createPlayer(id: string, index: number, money: string = "1000", status: PokerPlayerStatusType = PokerPlayerStatusType.PLAYING) : PokerPlayerModel
    {
        return new PokerPlayerModel(new UserProfileModel(id, new UserInfoModel(id, "", Date.now(), index), new UserStatisticsModel(), new UserFriendsModel()), index, money, undefined, status)
    }

    function createCommand(type: PokerGameCommandType, commandData: any) : PokerGameCommandModel
    {
        return PokerGameCommandModelUtils.Create("test", type, commandData, "server")
    }
})