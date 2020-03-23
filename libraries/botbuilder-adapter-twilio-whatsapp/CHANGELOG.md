# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2020-3
### Added
- Support for OAuth via Azure Bot Service

### Fixed
- Fix validation of X-Twilio-Signature
- Fix validation constructor parameters

### Changed
- Changed HTTP Status code from 401 to 403, when X-Twilio-Signature is invalid

### Changed
- Abstracting the code using the CustomWebAdapter
- Updated dependencies

## [1.1.0] - 2020-02
### Added
- Support location messages (inbound and outbound)

### Fixed
- Fixed the Twilio validation of incoming requests 

## [1.0.0] - 2019-09
### Changed
- Bumped for v1 release

## [0.1.0] - 2019-07
### Added
- First release of Twilio WhatsApp adapter
- Added support for: Send and receive text messages
- Added support for: Send and receive text messages with attachment (`image`, `audio`, `video`, `document`)
- Added support for: Send proactive notifications
- Added support for: Track message deliveries (`sent`, `delivered`, `read` receipts)