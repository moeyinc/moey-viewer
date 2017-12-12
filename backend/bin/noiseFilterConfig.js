module.exports = {
  SAMPLE_NUM: 10, // required number of samples for simple moving average
  REQUIRED_CONTINUAL_CHANGE_COUNT: 1, // how many times the smoothed values need to change continuously to be counted as a rotation
  STATIC_VALUE_COUNT_LIMIT: 20, // if the smoothed values continuously take a static value for this amount of counts, the moving status gets back to false
  CHANGE_THRESHOLD: 0.05 // how much it is required to recognize that there is a change in comparison between two smoothed values
}
