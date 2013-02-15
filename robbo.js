(function() {
    const CANVAS        = document.getElementById('game'),
          CONTEXT       = CANVAS.getContext('2d'),
          WIDTH         = 18,
          HEIGHT        = 14,
          AREA_WIDTH    = 16,
          AREA_HEIGHT   = 10,
          UNIT          = 32,
          FPS           = 12,
          IMG           = new Image();

    var lastRun 	    = 0,
        repeatRate      = 1000 / FPS,
        repeatRateTimer = null,
        level           = null,
        controlsEnabled = true,
        entities        = [],
        collidable      = [],
        movable         = [],
        collectable     = [],
        enterable       = [],
        playerMoveFrame = 0,
        playerMoveTimer = 0,
        playerCollision = false,
        entityAnimFrame = 0,
        entityAnimTimer = 0;

    var levels = [
        {
            bgColor: '#169212',
            entities: {
                player: [
                //    {x: 3, y: 3, d: 'down', p: true} // d = direction, p = player
                    {x: 6, y: 3, d: 'down', p: true}
                ],
                wall: [
                    {x: 1, y: 1},
                    {x: 2, y: 1},
                    {x: 3, y: 1},
                    {x: 4, y: 1},
                    {x: 5, y: 1},
                    {x: 6, y: 1},
                    {x: 7, y: 1},
                    {x: 8, y: 1},
                    {x: 9, y: 1},
                    {x: 10, y: 1},
                    {x: 11, y: 1},
                    {x: 12, y: 1},
                    {x: 13, y: 1},
                    {x: 14, y: 1},
                    {x: 15, y: 1},
                    {x: 16, y: 1},
                    {x: 1, y: 2},
                    {x: 5, y: 2},
                    {x: 9, y: 2},
                    {x: 12, y: 2},
                    {x: 16, y: 2},
                    {x: 1, y: 3},
                    {x: 5, y: 3},
                    {x: 9, y: 3},
                    {x: 10, y: 3},
                    {x: 12, y: 3},
                    {x: 16, y: 3},
                    {x: 1, y: 4},
                    {x: 3, y: 4},
                    {x: 5, y: 4},
                    {x: 10, y: 4},
                    {x: 12, y: 4},
                    {x: 16, y: 4},
                    {x: 1, y: 5},
                    {x: 5, y: 5},
                    {x: 6, y: 5},
                    {x: 12, y: 5},
                    {x: 14, y: 5},
                    {x: 16, y: 5},
                    {x: 1, y: 6},
                    {x: 6, y: 6},
                    {x: 8, y: 6},
                    {x: 9, y: 6},
                    {x: 10, y: 6},
                    {x: 11, y: 6},
                    {x: 12, y: 6},
                    {x: 14, y: 6},
                    {x: 16, y: 6},
                    {x: 1, y: 7},
                    {x: 6, y: 7},
                    {x: 9, y: 7},
                    {x: 14, y: 7},
                    {x: 16, y: 7},
                    {x: 1, y: 8},
                    {x: 2, y: 8},
                    {x: 3, y: 8},
                    {x: 4, y: 8},
                    {x: 6, y: 8},
                    {x: 9, y: 8},
                    {x: 14, y: 8},
                    {x: 16, y: 8},
                    {x: 1, y: 9},
                    {x: 6, y: 9},
                    {x: 7, y: 9},
                    {x: 9, y: 9},
                    {x: 14, y: 9},
                    {x: 16, y: 9},
                    {x: 1, y: 10},
                    {x: 6, y: 10},
                    {x: 9, y: 10},
                    {x: 11, y: 10},
                    {x: 12, y: 10},
                    {x: 13, y: 10},
                    {x: 14, y: 10},
                    {x: 16, y: 10}
                ],
                rubble: [
                    {x: 12, y: 7},
                    {x: 12, y: 8},
                    {x: 12, y: 9}
                ],
                ammo: [
                    {x: 2, y: 7}
                ],
                screw: [
                    {x: 10, y: 2},
                    {x: 7, y: 8}
                ],
                bomb: [
                    {x: 2, y: 9}
                ],
                crate: [
                    {x: 3, y: 5},
                    {x: 8, y: 4},
                    {x: 8, y: 8}
                ],
                teleport: [
                    {x: 7, y: 3, i: 1, t: 2}, // i = identifier, t = target
                    {x: 15, y: 2, i: 2, t: 1} // bylo x: 14
                ]
            }
        }
    ];

    window.requestAnimFrame = (function() {
        return (window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback, element) {
                window.setTimeout(function() {
                    callback(+new Date);
                }, repeatRate);
            });
    })();

    function inArray(needle, haystack) {
        for (var key in haystack) {
            if (haystack[key]['x'] === needle.x && haystack[key]['y'] === needle.y) {
                return haystack[key];
            }
        }

        return false;
    }

    function setLevel(lvl) {
        level = levels[lvl - 1];
        entities = level.entities;
        entities.smokeStart = [];
        entities.smokeEnd = [];

        for (var entity in entities) {
            for (var i = 0; i < entities[entity].length; i++) {
                switch (entity) {
                    case 'wall':
                    case 'rubble':
                        collidable[collidable.length] = entities[entity][i];
                        break;

                    case 'bomb':
                    case 'crate':
                        movable[movable.length] = entities[entity][i];
                        break;

                    case 'ammo':
                    case 'screw':
                        collectable[collectable.length] = entities[entity][i];
                        break;

                    case 'teleport':
                        enterable[enterable.length] = entities[entity][i];
                        break;
                }
            }
        }
    }

    function setPlayerDirection(direction) {
        entities.player[0].d = direction;

        if (!playerCollision) {
            playerMoveTimer = 1;
        }
    }

    function drawHUD() {}

    function drawArea() {
		CONTEXT.fillStyle = level.bgColor;
		CONTEXT.fillRect(UNIT, UNIT, AREA_WIDTH * UNIT, AREA_HEIGHT * UNIT);

        for (var entity in entities) {
            for (var i = 0; i < entities[entity].length; i++) {
                drawEntity(entities[entity][i], entity);
            }
        }
	}

	function drawEntity(entity, type) {
        var offset = {};

        switch (type) {
            case 'player':
                switch (entity.d) {
                    case 'up':
                        offset.x = 1;
                        offset.y = 2;
                        break;

                    case 'down':
                        offset.x = 1;
                        offset.y = 1;
                        break;

                    case 'left':
                        offset.x = 1;
                        offset.y = 3;
                        break;

                    case 'right':
                        offset.x = 1;
                        offset.y = 4;
                        break;
                }

                break;

            case 'wall':
                offset.x = 3;
                offset.y = 1;
                break;

            case 'rubble':
                offset.x = 2;
                offset.y = 11;
                break;

            case 'ammo':
                offset.x = 1;
                offset.y = 5;
                break;

            case 'screw':
                offset.x = 2;
                offset.y = 5;
                break;

            case 'bomb':
                offset.x = 2;
                offset.y = 8;
                break;

            case 'crate':
                offset.x = 1;
                offset.y = 10;
                break;

            case 'teleport':
                offset.x = 1;
                offset.y = 15;
                break;

            case 'smokeStart':
                offset.x = 1;
                offset.y = 12;
                break;

            case 'smokeEnd':
                offset.x = 4;
                offset.y = 12;
                break;
        }

        if (type === 'player') {
            offset.x = offset.x - 1 + playerMoveFrame;

            if (playerMoveTimer === 1) {
                playerMoveTimer = 2;

                CONTEXT.drawImage(IMG, offset.x * UNIT, (offset.y - 1) * UNIT, UNIT, UNIT, entity.x * UNIT, entity.y * UNIT, UNIT, UNIT);

                if (playerMoveTimer === 2) {
                    playerMoveTimer = 0;
                    playerMoveFrame = playerMoveFrame ? 0 : 1;

                    drawImage(offset.x, offset.y, entity.x, entity.y);
                }
            }
            else {
                drawImage(offset.x, offset.y, entity.x, entity.y);
            }
        }
        else if (type === 'teleport') {
            entityAnimTimer++;

            if (entityAnimTimer === 6) {
                entityAnimTimer = 0;
                entityAnimFrame = !entityAnimFrame;
                offset.x = offset.x + entityAnimFrame;
            }
            else {
                offset.x = offset.x + !entityAnimFrame;
            }

            drawImage(offset.x - 1, offset.y, entity.x, entity.y);
        }
        else if (type === 'smokeStart') {
            if (entity.f < 4) {
                offset.x = entity.f;

                drawImage(offset.x, offset.y, entity.x, entity.y);
            }
            else {
                for (var i = 0; i < entities.smokeStart.length; i++) {
                    if (entity.x === entities.smokeStart[i].x && entity.y === entities.smokeStart[i].y) {
                        entities.smokeStart.splice(i, 1);
                    }
                }

                for (var i = 0; i < collidable.length; i++) {
                    if (entity.x === collidable[i].x && entity.y === collidable[i].y) {
                        collidable.splice(i, 1);
                    }
                }
            }

            entity.f++;
        }
        else if (type === 'smokeEnd') {
            if (entity.f >= 0) {
                offset.x = entity.f;

                drawImage(offset.x, offset.y, entity.x, entity.y);
            }
            else {
                for (var i = 0; i < entities.smokeEnd.length; i++) {
                    if (entity.x === entities.smokeEnd[i].x && entity.y === entities.smokeEnd[i].y) {
                        entities.smokeEnd.splice(i, 1);
                    }
                }

                for (var i = 0; i < collidable.length; i++) {
                    if (entity.x === collidable[i].x && entity.y === collidable[i].y) {
                        collidable.splice(i, 1);
                    }
                }
            }

            entity.f--;
        }
        else {
            drawImage(offset.x - 1, offset.y, entity.x, entity.y);
        }
	}

    function drawImage(offsetX, offsetY, x, y) {
        CONTEXT.drawImage(IMG, offsetX * UNIT, (offsetY - 1) * UNIT, UNIT, UNIT, x * UNIT, y * UNIT, UNIT, UNIT);
    }

    function drawFrame() {
        CONTEXT.fillStyle = '#000';
        CONTEXT.fillRect(0, 0, WIDTH * UNIT, HEIGHT * UNIT);

        drawHUD();
        drawArea();
    }

    function playSound(sound) {}

    function gameLoop() {
        var now = new Date().getTime();

        if ((now - lastRun) > repeatRate) {
            drawFrame();

            lastRun = new Date().getTime();
        }

        requestAnimFrame(gameLoop);
    }

    function getPredictedPosition(entity) {
        var predictedPosition = {
            x: entity.x,
            y: entity.y
        };

        switch (entity.d) {
            case 'up':
                predictedPosition.y -= 1;
                break;

            case 'down':
                predictedPosition.y += 1;
                break;

            case 'left':
                predictedPosition.x -= 1;
                break;

            case 'right':
                predictedPosition.x += 1;
                break;
        }

        return predictedPosition;
    }

    function detectInteraction(mover) {
        var moverPredictedPosition = getPredictedPosition(mover),
            interaction = false,
            nextEntity = null,
            collectedEntity = null,
            enteredEntity = null;

        if (inArray(moverPredictedPosition, collidable)) {
            interaction = 'collision';
        }

        if (nextEntity = inArray(moverPredictedPosition, movable)) {
            nextEntity.d = entities.player[0].d;

            switch (nextEntity.d) {
                case 'up':
                    if (detectInteraction(nextEntity) !== 'collision') {
                        nextEntity.y -= 1;
                        interaction = 'move';
                    }
                    else {
                        interaction = 'collision';
                    }

                    break;

                case 'down':
                    if (detectInteraction(nextEntity) !== 'collision') {
                        nextEntity.y += 1;
                        interaction = 'move';
                    }
                    else {
                        interaction = 'collision';
                    }

                    break;

                case 'left':
                    if (detectInteraction(nextEntity) !== 'collision') {
                        nextEntity.x -= 1;
                        interaction = 'move';
                    }
                    else {
                        interaction = 'collision';
                    }

                    break;

                case 'right':
                    if (detectInteraction(nextEntity) !== 'collision') {
                        nextEntity.x += 1;
                        interaction = 'move';
                    }
                    else {
                        interaction = 'collision';
                    }

                    break;
            }
        }

        if (collectedEntity = inArray(moverPredictedPosition, collectable)) {
            if (mover.p) {
                for (var i = 0; i < entities.ammo.length; i++) {
                    if (collectedEntity.x === entities.ammo[i].x && collectedEntity.y === entities.ammo[i].y) {
                        entities.ammo.splice(i, 1);
                        collectable.splice(i, 1);

                        playSound('ammo');
                    }
                }

                for (var i = 0; i < entities.screw.length; i++) {
                    if (collectedEntity.x === entities.screw[i].x && collectedEntity.y === entities.screw[i].y) {
                        entities.screw.splice(i, 1);

                        playSound('screw');
                    }
                }

                for (var i = 0; i < collectable.length; i++) {
                    if (collectedEntity.x === collectable[i].x && collectedEntity.y === collectable[i].y) {
                        collectable.splice(i, 1);
                    }
                }

                interaction = 'collect';
            }
            else {
                interaction = 'collision';
            }
        }

        if (enteredEntity = inArray(moverPredictedPosition, enterable)) {
            if (mover.p) {
                for (var i = 0; i < entities.teleport.length; i++) {
                    if (enteredEntity.x === entities.teleport[i].x && enteredEntity.y === entities.teleport[i].y) {
                        performTeleport(enteredEntity, entities.player[0].d);
                    }
                }

                interaction = 'teleport';
            }
            else {
                interaction = 'collision';
            }
        }

        return interaction;
    }

    function detectTeleportCollision(enteredEntity, arrivalPlace) {
        for (var entity in entities) {
            for (var i = 0; i < entities[entity].length; i++) {
                if (entities[entity][i].x === arrivalPlace.x && entities[entity][i].y === arrivalPlace.y) {
                    return true;
                }
            }
        }

        return false;
    }

    function performTeleport(enteredEntity, direction) {
        console.log(direction)
        var target = null,
            arrivalPlace = {},
            smokeStartEntity = {
                f: 0    // framesCount
            },
            smokeEndEntity = {
                x: entities.player[0].x,
                y: entities.player[0].y,
                f: 3    // framesCount
            };

        for (var i = 0; i < enterable.length; i++) {
            if (enterable[i].i === enteredEntity.t) {
                target = enterable[i];
            }
        }

        switch (direction) {
            case 'up':
                arrivalPlace.x = target.x;
                arrivalPlace.y = target.y - 1;

                if (detectTeleportCollision(enteredEntity, arrivalPlace)) {
                    performTeleport(enteredEntity, 'right');

                    return false;
                }

                break;

            case 'down':
                arrivalPlace.x = target.x;
                arrivalPlace.y = target.y + 1;

                if (detectTeleportCollision(enteredEntity, arrivalPlace)) {
                    performTeleport(enteredEntity, 'left');

                    return false;
                }

                break;

            case 'left':
                arrivalPlace.x = target.x - 1;
                arrivalPlace.y = target.y;

                if (detectTeleportCollision(enteredEntity, arrivalPlace)) {
                    performTeleport(enteredEntity, 'up');

                    return false;
                }

                break;

            case 'right':
                arrivalPlace.x = target.x + 1;
                arrivalPlace.y = target.y;

                if (detectTeleportCollision(enteredEntity, arrivalPlace)) {
                    performTeleport(enteredEntity, 'down');

                    return false;
                }

                break;
        }

        collidable[collidable.length] = smokeEndEntity;
        entities.smokeEnd[entities.smokeEnd.length] = smokeEndEntity;
        entities.player[0].x = -UNIT;
        entities.player[0].y = -UNIT;

        window.setTimeout(function() {
            smokeStartEntity.x = arrivalPlace.x;
            smokeStartEntity.y = arrivalPlace.y;
            collidable[collidable.length] = smokeStartEntity;
            entities.smokeStart[entities.smokeStart.length] = smokeStartEntity;

            window.setTimeout(function() {
                entities.player[0].x = arrivalPlace.x;
                entities.player[0].y = arrivalPlace.y;
            }, repeatRate * 4);
        }, repeatRate * 3);

        playSound('teleport');
    }

    function inputHandler(e) {
        e.preventDefault();

        if (repeatRateTimer == null && controlsEnabled) {
            repeatRateTimer = window.setTimeout(function() {
                switch (e.keyCode) {
                    case 38:  // Up
                        setPlayerDirection('up');

                        if (entities.player[0].y - 1 >= 1 && detectInteraction(entities.player[0]) !== 'collision') {
                            entities.player[0].y -= 1;
                            playerCollision = false;
                        }
                        else {
                            playerCollision = true;
                        }

                        break;

                    case 40:  // Down
                        setPlayerDirection('down');

                        if (entities.player[0].y + 1 <= AREA_HEIGHT && detectInteraction(entities.player[0]) !== 'collision') {
                            entities.player[0].y += 1;
                            playerCollision = false;
                        }
                        else {
                            playerCollision = true;
                        }

                        break;

                    case 37:  // Left
                        setPlayerDirection('left');

                        if (entities.player[0].x - 1 >= 1 && detectInteraction(entities.player[0]) !== 'collision') {
                            entities.player[0].x -= 1;
                            playerCollision = false;
                        }
                        else {
                            playerCollision = true;
                        }

                        break;

                    case 39:  // Right
                        setPlayerDirection('right');

                        if (entities.player[0].x + 1 <= AREA_WIDTH && detectInteraction(entities.player[0]) !== 'collision') {
                            entities.player[0].x += 1;
                            playerCollision = false;
                        }
                        else {
                            playerCollision = true;
                        }

                        break;
                }

                repeatRateTimer = null;
            }, repeatRate);
        }
    }

    IMG.src = 'robbo.png';
    IMG.onload = function() {
        CANVAS.width = WIDTH * UNIT;
        CANVAS.height = HEIGHT * UNIT;
        CANVAS.addEventListener('keydown', inputHandler, true);
        CANVAS.focus();

        setLevel(1);
        gameLoop();
    }
})();