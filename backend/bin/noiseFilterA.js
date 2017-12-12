"use strict";
var nfConfig = require('./noiseFilterConfig.js')

var recentOriginalValues = []; // array to store sample values for simple moving average
var sampleNum = nfConfig.SAMPLE_NUM; // required number of samples for simple moving average

var recentSmoothedValues = []; // array to store smoothed values
var requiredContinualChangeCount = nfConfig.REQUIRED_CONTINUAL_CHANGE_COUNT; // how many times the smoothed values need to change continuously to be counted as a rotation
var staticValueCountLimit = nfConfig.STATIC_VALUE_COUNT_LIMIT; // if the smoothed values continuously take a static value for this amount of counts, the moving status gets back to false
var smoothedSampleNum = requiredContinualChangeCount * staticValueCountLimit; // required number of samples for rotary detection
var changeThreshold = nfConfig.CHANGE_THRESHOLD; // how much it is required to recognize that there is a change in comparison between two smoothed values

module.exports = {
  filter: function (data) {
    var result = {isRotating: false, encoder: '', value: 0}

    // if data is not set, return false
    if (!data) return result;

    // parse id and values from the payload
    var encoderID = data.charAt(0);
    var originalValue = data.substr(1);
    var originalValue = parseInt(originalValue);

    // add it to the last of the array and keep the length of the array
    var isOK = shiftPush(recentOriginalValues, sampleNum, originalValue);
    if (!isOK) return result;

    // calculate the average of the recent samples in the array ---------------
    var sum = 0;
    for (var i = 0; i < recentOriginalValues.length; i++) {
      sum += recentOriginalValues[i];
    }
    var smoothedValue = sum / sampleNum;

    // add it to the last of the array and keep the length of the array
    var isOK = shiftPush(recentSmoothedValues, smoothedSampleNum, smoothedValue);
    if (!isOK) return result;

    // check if there is a rotation
    if (detectRotation()) {
      result.isRotating = true;
      result.encoder = encoderID;
      result.value = recentSmoothedValues[smoothedSampleNum -1];
    } else {
      result.isRotating = false;
    }

    return result;
  }
}

// =========================================================
function shiftPush (array, arrayLengthToKeep, valueToAdd) {
  if (!Array.isArray(array)) {
    console.error('The argument <array> is not an array!', array);
    return false;
  }

  if (!Number.isInteger(arrayLengthToKeep) || arrayLengthToKeep <= 0) {
    console.error('The argument <arrayLengthToKeep> is not a valid number!', arrayLengthToKeep);
    return false;
  }

  if (!Number.isFinite(valueToAdd) || valueToAdd < 0) {
    console.error('The argument <valueToAdd> is not a valid number!', valueToAdd);
    return false;
  }

  // add the new value to the array
  array.push(valueToAdd);

  // if the length of the array hasn't reached the required length, return false
  if (array.length < arrayLengthToKeep) {
    return false;
  }

  // delete the oldest value
  while (array.length > arrayLengthToKeep) {
    array.shift();
  }

  return true;
}

// =========================================================
function detectRotation () {
  var continualChangeCount = 0;
  var staticCount = 0;

  for (var i = recentSmoothedValues.length-1; i > 1; i--) {
    var delta = recentSmoothedValues[i-1] - recentSmoothedValues[i];
    // console.log('i: ' + i + ', delta: ' + delta)
    if (delta > changeThreshold) {
      // if the value at i is greater than the value at i-1...
      staticCount = 0;

      if (continualChangeCount === 0) {
        // if the continualChangeCount is zero, there have been no changes so far
        // so just increment the value and continue to the next iteration
        continualChangeCount++;
        continue;
      } else if (continualChangeCount > 0) {
        // if the continualChangeCount is a positive number, there have been increases so far
        // and this time you also got another increase so let's move on to the next iteration
        continualChangeCount++;

        if (Math.abs(continualChangeCount) >= requiredContinualChangeCount){
          // if it reaches the required numebr of continual changes, return true
          return true;
        }
        continue;

      } else if (continualChangeCount < 0){
        // if the continualChangeCount is a negative number, it means there have been decreases so far
        // so it ruins our expectation that there is a continual decrease.
        // then let's finish the calcuration with returning false
        return false;
      }
    } else if (delta < -changeThreshold) {
      // if the value at i is less than the value at i-1...
      staticCount = 0;

      if (continualChangeCount == 0) {
        // if the continualChangeCount is zero, there have been no changes so far
        // so just decrement the value and continue to the next iteration
        continualChangeCount--;
        continue;
      } else if (continualChangeCount > 0) {
        // if the continualChangeCount is a positive number, there have been increases so far
        // so it ruins our expectation that there is a continual increase.
        // then let's finish the calcuration with returning false
        return false;
      } else if (continualChangeCount < 0){
        // if the continualChangeCount is a negative number, it means there have been decreases so far
        // and this time you also got another decrease so let's move on to the next iteration
        continualChangeCount--;

        if (Math.abs(continualChangeCount) >= requiredContinualChangeCount){
          // if it reaches the required numebr of continual changes, return true
          return true;
        }
        continue;

      }
    } else {
      // if the value at i is almost the same as the value at i-1...

      // when the values continuously take a static value for a certain amount of counts, the moving status gets back to false
      staticCount++;
      if (staticCount > staticValueCountLimit) {
        return false;
      }

      // let's just continue to the next iteration
      continue;
    }
  }

  return false;
}
