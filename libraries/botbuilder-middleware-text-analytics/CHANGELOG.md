# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2019-08
### Added
- Inherits from Text Analysis Core Engine
- Separated out examples and tests
- Added exception messages for unsupported analysis methods

## [2.0.0] - 2019-09
### Added
- `TextAnalysisOptions` added as a schema item (interface) that extends the `ServiceClientOptions` for single constructor argument
### Changed
- Constructor accepts `TextAnalysisOptions` instead of three separate parameters
