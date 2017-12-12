// ============= libraries and global variables =============
import processing.serial.*;
Serial myPort;

import controlP5.*;
ControlP5 cp5;
Range range;
boolean displayOriginalValues = true;
boolean displaySmoothedValues = true;

char encoderID = 'A';
ArrayList<Integer> originalValues = new ArrayList<Integer>();
ArrayList<Float> smoothedValues = new ArrayList<Float>();
ArrayList<Boolean> smoothedValuesMogvingStatus = new ArrayList<Boolean>(); 
int sampleNum = 5; // sample number for simple moving average
int requiredContinualChangeCount = 3; // how many times the values need to change continuously to detect the rotation
int staticValueCountLimit = 20; // when the values continuously take a static value for a certain amount of counts, the moving status gets back to false

int noiseCount = 0; // how many times noises occured

// ============= setup() =============
void setup() {
  size(1920, 800);
  printArray(Serial.list());
  String portName = "/dev/cu.usbmodem3533221";
  myPort = new Serial(this, portName, 115200);
  myPort.bufferUntil('\n');
  myPort.clear();
  
  cp5 = new ControlP5(this);
  range = cp5.addRange("Sensor Value Monitoring Range")
             // disable broadcasting since setRange and setRangeValues will trigger an event
             .setBroadcast(false)
             .setPosition(20, 60)
             .setSize(400, 40)
             .setHandleSize(20)
             .setRange(0, 4500)
             .setRangeValues(0, 4500)
             // after the initialization we turn broadcast back on again
             .setBroadcast(true)
             .setColorForeground(color(255,40))
             .setColorBackground(color(255,40))  
             ;
  cp5.addSlider("sampleNum")
     .setPosition(700, 20)
     .setWidth(400)
     .setRange(2, 29)
     .setNumberOfTickMarks(27)
     .setSliderMode(Slider.FLEXIBLE)
     ;
  cp5.addSlider("requiredContinualChangeCount")
     .setPosition(700, 60)
     .setWidth(400)
     .setRange(1, 10)
     .setNumberOfTickMarks(10)
     .setSliderMode(Slider.FLEXIBLE)
     ;
  cp5.addSlider("staticValueCountLimit")
     .setPosition(700, 100)
     .setWidth(400)
     .setRange(2, 29)
     .setNumberOfTickMarks(27)
     .setSliderMode(Slider.FLEXIBLE)
     ;
  cp5.addToggle("displayOriginalValues")
     .setPosition(20, 120)
     .setSize(50,20)
     .setValue(true)
     .setMode(ControlP5.SWITCH)
     ;
  cp5.addToggle("displaySmoothedValues")
     .setPosition(150, 120)
     .setSize(50,20)
     .setValue(true)
     .setMode(ControlP5.SWITCH)
     ;
  cp5.addBang("reset")
     .setPosition(1500, 20)
     .setSize(40, 40)
     .setLabel("reset graph")
     ;
}

// ============= draw() =============
void draw() {
  background(0);
  fill(255);
  text("Framerate: " + frameRate, 20, 20);
  if (originalValues.size() > 1) {
    text("Original Sensor Value from encoder " + encoderID + ": " + originalValues.get(originalValues.size()-1), 20, 40);
  }
  text("Moving Status Count: " + noiseCount, 1500, 100);
  
  if (displayOriginalValues) {
    drawOriginalValues();
  }
  
  if (displaySmoothedValues) {
    drawSmoothedValues();
  }
}

// ============= drawOriginalValues() =============
void drawOriginalValues() {
  for (int i = 0; i < originalValues.size(); i++) {
    if (i == 0) continue;
    
    float px = i-1;
    float x = i;
    
    float py = map(originalValues.get(i-1), range.getLowValue(), range.getHighValue(), height - 100, 100);
    float y = map(originalValues.get(i), range.getLowValue(), range.getHighValue(), height - 100, 100);
    
    stroke(255);
    strokeWeight(3);
    line(px, py, x, y);
  }
  
  // clear arraylist if the graph reaches right edge
  if(originalValues.size() >= width) {
    reset();
  }
}

// ============= drawSmoothedValues() =============
void drawSmoothedValues() {
  for (int i = 0; i < smoothedValues.size(); i++) {
    if (i == 0) continue;
    
    float px = i-1;
    float x = i;
    
    float py = map(smoothedValues.get(i-1), range.getLowValue(), range.getHighValue(), height - 100, 100);
    float y = map(smoothedValues.get(i), range.getLowValue(), range.getHighValue(), height - 100, 100);
    
    boolean isMoving = smoothedValuesMogvingStatus.get(i);
    if (isMoving) {
      stroke(255, 0, 0);
    } else {
      stroke(0, 255, 0);
    }
    strokeWeight(3);
    line(px, py, x, y);
  }
  
  // clear arraylist if the graph reaches right edge
  if(smoothedValues.size() >= width) {
    reset();
  }
}

// ============= serialEvent() =============
void serialEvent(Serial p) {
  try {
    String s = p.readString();
  
    if (s != null) {
      s = trim(s); // trim off line feed character
      
      char id = s.charAt(0);
      int value = int(s.substring(1));
      //println(encoderID + ": " + value);
      
      if (id != encoderID) return;
      originalValues.add(value); // add the value to the sensor value array list
      
      // calculate smoothed values with simple moving average
      smoothWithSMA(value);
      
      boolean result = detectRotation();
      smoothedValuesMogvingStatus.add(result);
      if (result) noiseCount++;
    }
  } catch (RuntimeException e) {
    e.printStackTrace();
  }
}

// ============= smoothWithSMA() =============
void smoothWithSMA(int _value) {
  if (originalValues.size() < sampleNum) return;
  int sum = 0;
  for (int i = 0; i < sampleNum; i++) {
    int lastIndex = originalValues.size() - 1;
    sum += originalValues.get(lastIndex - i);
  }
  
  float smoothedValue = sum / sampleNum;
  smoothedValues.add(smoothedValue);
}

boolean detectRotation() {
  int continualChangeCount = 0;
  int staticCount = 0;
  
  for (int i = smoothedValues.size()-1; i > 1; i--) {
    float delta = smoothedValues.get(i-1) - smoothedValues.get(i);
    if (delta > 0.0001) {
      // if the value at i is greater than the value at i-1...
      staticCount = 0;
      
      if (continualChangeCount == 0) {
        // if the continualChangeCount is zero, there have been no changes so far
        // so just increment the value and continue to the next iteration
        continualChangeCount++;
        continue;
      } else if (continualChangeCount > 0) {
        // if the continualChangeCount is a positive number, there have been increases so far
        // and this time you also got another increase so let's move on to the next iteration 
        continualChangeCount++;
        
        if (abs(continualChangeCount) >= requiredContinualChangeCount){
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
    } else if (delta < -0.0001) {
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
        
        if (abs(continualChangeCount) >= requiredContinualChangeCount){
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

void reset() {
  originalValues = new ArrayList<Integer>();
  smoothedValues = new ArrayList<Float>();
  smoothedValuesMogvingStatus = new ArrayList<Boolean>();
  noiseCount = 0;
}