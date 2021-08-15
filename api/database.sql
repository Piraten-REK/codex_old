USE codex;

CREATE TABLE `user` (
    id                  BIGINT UNSIGNED     NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username            VARCHAR(128)        NOT NULL UNIQUE,
    display_name        VARCHAR(512)        NOT NULL,
    email               VARCHAR(768)        NOT NULL UNIQUE,
    password            CHAR(60)            NOT NULL,
    bio                 TEXT,
    gender              SET('f', 'm', 'a')  NOT NULL DEFAULT 'a',
    is_active           BOOLEAN             NOT NULL DEFAULT TRUE,
    is_admin            BOOLEAN             NOT NULL DEFAULT FALSE
);

-- set default admin user
INSERT INTO `user` (id, username, display_name, email, password, is_admin) VALUES(
    0,
    'admin',
    'Administrator',
    'admin@example.com',
    '$2a$12$SS9Oz6iryj6LSHV.pC1.NuqwGisFllYazWmvh8Q6ggdJgKSOC97bu',
    TRUE
);

CREATE TABLE `file` (
    id                  BIGINT UNSIGNED     NOT NULL PRIMARY KEY AUTO_INCREMENT,
    filename            VARCHAR(768)        NOT NULL,
    created             DATETIME            NOT NULL DEFAULT CURTIME(),
    uploader            BIGINT UNSIGNED     NOT NULL,
    FOREIGN KEY (uploader) REFERENCES `user`(id) ON DELETE RESTRICT
);

ALTER TABLE `user`
    ADD COLUMN
    avatar BIGINT UNSIGNED
    AFTER bio;
ALTER TABLE `user`
    ADD CONSTRAINT
    FOREIGN KEY (avatar) REFERENCES `file`(id) ON DELETE SET NULL;

CREATE TABLE committee (
    `period`            INT UNSIGNED        NOT NULL PRIMARY KEY AUTO_INCREMENT,
    start               DATE                NOT NULL,
    `end`               DATE,
    hero_img            BIGINT UNSIGNED,
    rules_of_procedure  TEXT,
    FOREIGN KEY (hero_img) REFERENCES `file`(id) ON DELETE SET NULL
);

CREATE TABLE committee_role (
    id                  INT UNSIGNED        NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title               VARCHAR(256)        NOT NULL,
    title_f             VARCHAR(256)        NOT NULL,
    title_m             VARCHAR(256)        NOT NULL,
    is_advisory         BOOLEAN             NOT NULL DEFAULT FALSE
);

CREATE TABLE committee_member (
    user_id             BIGINT UNSIGNED     NOT NULL,
    committee_period    INT UNSIGNED        NOT NULL,
    role_id             INT UNSIGNED        NOT NULL,
    start               DATE                NOT NULL,
    `end`               DATE,
    PRIMARY KEY (user_id, committee_period, start),
    FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE RESTRICT,
    FOREIGN KEY (committee_period) REFERENCES committee(period) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (role_id) REFERENCES committee_role(id) ON DELETE RESTRICT
);

CREATE TABLE application_category (
    id                  INT UNSIGNED        NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title               VARCHAR(256)        NOT NULL UNIQUE,
    application         BOOLEAN             NOT NULL DEFAULT TRUE,
    single_resolution   BOOLEAN             NOT NULL DEFAULT TRUE
);

CREATE TABLE application (
    id                      BIGINT UNSIGNED     NOT NULL PRIMARY KEY AUTO_INCREMENT,
    committee_period        INT UNSIGNED        NOT NULL,
    `number`                INT UNSIGNED        NOT NULL,
    category                INT UNSIGNED        NOT NULL,
    start                   DATE                NOT NULL,
    `end`                   DATE,
    title                   VARCHAR(768)        NOT NULL,
    `text`                  TEXT                NOT NULL,
    reason                  TEXT,
    status                  SET(
        'new',
        'postponed',
        'rejected',
        'accepted',
        'dismissed',
        'retracted',
        'in consultation'
    )                                           NOT NULL DEFAULT 'new',
    applicant_is_user       BOOLEAN             NOT NULL,
    applicant_user_id       BIGINT UNSIGNED,
    applicant_name          VARCHAR(512),
    implementation_is_user  BOOLEAN             NOT NULL,
    implementation_user_id  BIGINT UNSIGNED,
    implementation_name     VARCHAR(512),
    is_circular             BOOLEAN             NOT NULL DEFAULT FALSE,
    cost                    FLOAT(8,2)          NOT NULL DEFAULT 0.0,
    rt_reference            INT UNSIGNED,
    -- ToDo: Protocol

    FOREIGN KEY (committee_period) REFERENCES committee(`period`) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (category) REFERENCES application_category(id) ON DELETE RESTRICT,
    FOREIGN KEY (applicant_user_id) REFERENCES `user`(id) ON DELETE RESTRICT,
    FOREIGN KEY (implementation_user_id) REFERENCES `user`(id) ON DELETE RESTRICT
);

CREATE TABLE application_history (
    id                      BIGINT UNSIGNED     NOT NULL PRIMARY KEY AUTO_INCREMENT,
    appication_id             BIGINT UNSIGNED     NOT NULL,
    editor                  BIGINT UNSIGNED     NOT NULL,
    `timestamp`             DATETIME            NOT NULL DEFAULT CURDATE(),
    changes                 TEXT                NOT NULL,

    FOREIGN KEY (editor) REFERENCES `user`(id) ON DELETE RESTRICT,
    FOREIGN KEY (appication_id) REFERENCES application(id)
);

DELIMITER //

CREATE TRIGGER application_insert
    BEFORE INSERT
    ON application
    FOR EACH ROW
BEGIN
    IF NEW.`number` IS NULL THEN
        SET NEW.`number` := IFNULL((SELECT (SELECT `number` FROM application a WHERE a.committee_period = NEW.committee_period ORDER BY `number` DESC LIMIT 1) + 1), 1);
    END IF;

    IF NEW.status = 'in consultation' AND NEW.is_circular = FALSE THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Status `in consultation` in not circular resolution';
    END IF;

    IF NEW.applicant_is_user = TRUE THEN
        SET NEW.applicant_name := NULL;

        IF NEW.applicant_user_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`applicant_user_id` is null';
        END IF;
    ELSE
        SET NEW.applicant_user_id := NULL;

        IF NEW.applicant_name IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`applicant_name` is null';
        END IF;
    END IF;

    IF NEW.implementation_is_user = TRUE THEN
        SET NEW.implementation_name := NULL;

        IF NEW.implementation_user_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`implementation_user_id` is null';
        END IF;
    ELSE
        SET NEW.implementation_user_id := NULL;

        IF NEW.implementation_name IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`implementation_name` is null';
        END IF;
    END IF;

    IF NEW.start > CURTIME() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`start` is in the future';
    END IF;
END //

CREATE TRIGGER application_update
    BEFORE UPDATE
    ON application
    FOR EACH ROW
BEGIN
    IF NEW.status = 'in consultation' AND NEW.is_circular = FALSE THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Status `in consultation` in not circular resolution';
    END IF;

    IF NEW.applicant_is_user = TRUE THEN
        SET NEW.applicant_name := NULL;

        IF NEW.applicant_user_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`applicant_user_id` is null';
        END IF;
    ELSE
        SET NEW.applicant_user_id := NULL;

        IF NEW.applicant_name IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`applicant_name` is null';
        END IF;
    END IF;

    IF NEW.implementation_is_user = TRUE THEN
        SET NEW.implementation_name := NULL;

        IF NEW.implementation_user_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`implementation_user_id` is null';
        END IF;
    ELSE
        SET NEW.implementation_user_id := NULL;

        IF NEW.implementation_name IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`implementation_name` is null';
        END IF;
    END IF;

    IF NEW.start > CURTIME() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`start` is in the future';
    END IF;
END //

DELIMITER ;

CREATE TABLE vote (
    user_id             BIGINT UNSIGNED     NOT NULL,
    application_id      BIGINT UNSIGNED     NOT NULL,
    behaviour           SET(
        'in favor',
        'oppose',
        'abstained'
    ),

    PRIMARY KEY (user_id, application_id),
    FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE RESTRICT,
    FOREIGN KEY (application_id) REFERENCES application(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE vote_history (
    id                  BIGINT UNSIGNED     NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id             BIGINT UNSIGNED     NOT NULL,
    application_id      BIGINT UNSIGNED     NOT NULL,
    editor              BIGINT UNSIGNED     NOT NULL,
    `timestamp`         DATETIME            NOT NULL DEFAULT CURTIME(),
    changes             TEXT                NOT NULL,

    FOREIGN KEY (editor) REFERENCES `user`(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id, application_id) REFERENCES vote(user_id, application_id)
);

DELIMITER //

CREATE TRIGGER vote_insert
    BEFORE INSERT
    ON vote
    FOR EACH ROW
BEGIN
    IF NEW.user_id NOT IN (SELECT DISTINCT m.user_id FROM application a INNER JOIN committee_member m ON m.committee_period = a.committee_period WHERE a.id = NEW.application_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'user is not a member of application\'s committee';
    END IF;

    IF NEW.user_id NOT IN (SELECT DISTINCT m.user_id FROM application a INNER JOIN committee_member m ON m.committee_period = a.committee_period INNER JOIN committee_role r ON m.role_id = r.id WHERE a.id = NEW.application_id AND r.is_advisory = FALSE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'user has no voting rights for this application';
    END IF;
END //

CREATE TRIGGER vote_update
    BEFORE UPDATE
    ON vote
    FOR EACH ROW
BEGIN
    IF NEW.user_id NOT IN (SELECT DISTINCT m.user_id FROM application a INNER JOIN committee_member m ON m.committee_period = a.committee_period WHERE a.id = NEW.application_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'user is not a member of application\'s committee';
    END IF;

    IF NEW.user_id NOT IN (SELECT DISTINCT m.user_id FROM application a INNER JOIN committee_member m ON m.committee_period = a.committee_period INNER JOIN committee_role r ON m.role_id = r.id WHERE a.id = NEW.application_id AND r.is_advisory = FALSE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'user has no voting rights for this application';
    END IF;
END //

DELIMITER ;

CREATE TABLE single_resolution (
    id                  BIGINT UNSIGNED     NOT NULL PRIMARY KEY AUTO_INCREMENT,
    committee_period    INT UNSIGNED        NOT NULL,
    `number`            INT UNSIGNED        NOT NULL,
    category            INT UNSIGNED        NOT NULL,
    start               DATE                NOT NULL,
    `end`               DATE,
    title               VARCHAR(768)        NOT NULL,
    `text`              TEXT                NOT NULL,
    reason              TEXT,
    status              SET(
        'new',
        'in process',
        'postponed',
        'feedback',
        'done',
        'rejected',
        'retracted'
    )                                       NOT NULL DEFAULT 'new',
    cost                FLOAT(8,2)          NOT NULL DEFAULT 0.0,
    rt_reference        INT UNSIGNED,

    FOREIGN KEY (committee_period) REFERENCES committee(`period`) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (category) REFERENCES application_category(id) ON DELETE RESTRICT
);

DELIMITER //

CREATE TRIGGER single_resolution_insert
    BEFORE INSERT
    ON single_resolution
    FOR EACH ROW
BEGIN
    IF NEW.`number` IS NULL THEN
        SET NEW.`number` := IFNULL((SELECT (SELECT `number` FROM single_resolution r WHERE r.committee_period = NEW.committee_period ORDER BY `number` DESC LIMIT 1) + 1), 1);
    END IF;

    IF NEW.start > CURTIME() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`start` is in the future';
    END IF;
END //

CREATE TRIGGER single_resolution_update
    BEFORE UPDATE
    ON single_resolution
    FOR EACH ROW
BEGIN
    IF NEW.start > CURTIME() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '`start` is in the future';
    END IF;
END //

DELIMITER ;

CREATE TABLE single_resolution_history (
    id                  BIGINT UNSIGNED     NOT NULL PRIMARY KEY AUTO_INCREMENT,
    resolution_id       BIGINT UNSIGNED     NOT NULL,
    editor              BIGINT UNSIGNED     NOT NULL,
    `timestamp`         DATETIME            NOT NULL DEFAULT CURTIME(),
    data                TEXT                NOT NULL,

    FOREIGN KEY (editor) REFERENCES `user`(id) ON DELETE RESTRICT,
    FOREIGN KEY (resolution_id) REFERENCES single_resolution(id)
);

CREATE TABLE session (
    token               VARCHAR(256)        NOT NULL PRIMARY KEY,
    expires             DATETIME            NOT NULL,
    user_id             BIGINT UNSIGNED     NOT NULL,

    FOREIGN KEY (user_id) REFERENCES `user`(id)
);
