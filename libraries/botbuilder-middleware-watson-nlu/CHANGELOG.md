# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2020-03
### Changed
- Updated dependencies

## [1.1.0] - 2019-10
### Added
- Added `getEmotions()` static method
- Added `rankEmotionKeys()` static method
- Added `rankEmotions()` static method
- Added `topEmotion()` static method
- Added `topEmotionScore()` static method
- Added `calculateDifference()` static method
- Added `calculateVariance()` static method
- Sets 'emotionTargets' in the `TurnState` if targets were requested
- Added `getEntities()` static method
- Added `rankEntityKeys()` static method
- Added `rankEntities()` static method
- Added `topEntity()` static method
- Added `topEntityResult()` static method
- Added `rankKeywordKeys()` static method
- Added `rankKeywords()` static method
- Added `topKeyword()` static method
- Added `topKeywordResult()` static method

### Changed
- Passes `config` to the `emotion()` method
- Failing to process an emotion no longer throws an exception, but instead logs with `console.error()`

## [1.0.1] - 2019-09
### Fixed
- API version was outdated

## [1.0.0] - 2019-08
### Added
- First release of IBM Watson NLU text analysis middleware
- Inherits from Text Analysis Core Engine
- Added support for categories, concepts, emotions, entities, keywords, and sentiment