function smartScale(min, max, mticks) {
  // let minPoint;
  // let maxPoint;
  // let maxTicks = mticks;
  // let tickSpacing;
  // let range;
  // let niceMin;
  // let niceMax;

  /**    * Instantiates a new instance of the NiceScale class.     */
  function niceScale(min, max, mticks) {
    // minPoint = min;
    // maxPoint = max;
    const mycalc=calculate(min, max, mticks);
    return {
      tickSpacing: mycalc.tickSpacing,
      niceMinimum: mycalc.niceMinimum,
      niceMaximum: mycalc.niceMaximum,
    };
  }

  /**
   * Calculate and update values for tick spacing and nice
   * minimum and maximum data points on the axis.
   */
  function calculate(minPoint,maxPoint,maxTicks) {
    const range = niceNum(maxPoint - minPoint, false);
    const tickSpacing = niceNum(range / (maxTicks - 1), true);
    const niceMin = Math.floor(minPoint / tickSpacing) * tickSpacing;
    const niceMax = Math.ceil(maxPoint / tickSpacing) * tickSpacing;
    return {
      tickSpacing: tickSpacing,
      niceMinimum: niceMin,
      niceMaximum: niceMax,
    };
    //console.log("-",minPoint,maxPoint,niceMin,niceMax);
  }

  /**
   * Returns a "nice" number approximately equal to range Rounds
   * the number if round = true Takes the ceiling if round = false.
   *
   *  localRange the data range
   *  round whether to round the result
   *  a "nice" number to be used for the data range
   */
  function niceNum(localRange, round) {
    // const exponent; /** exponent of localRange */
    // const fraction; /** fractional part of localRange */
    let niceFraction; /** nice, rounded fraction */

    const exponent = Math.floor(Math.log10(localRange));
    const fraction = localRange / Math.pow(10, exponent);

    if (round) {
      if (fraction < 1.5) niceFraction = 1;
      else if (fraction < 3) niceFraction = 2;
      else if (fraction < 7) niceFraction = 5;
      else niceFraction = 10;
    } else {
      if (fraction <= 1) niceFraction = 1;
      else if (fraction <= 2) niceFraction = 2;
      else if (fraction <= 5) niceFraction = 5;
      else niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent);
  }

  // function setMinMaxPoints(localMinPoint, localMaxPoint) {
  //   minPoint = localMinPoint;
  //   maxPoint = localMaxPoint;
  //   calculate();
  // }

  // function setMaxTicks(localMaxTicks) {
  //   maxTicks = localMaxTicks;
  //   calculate();
  // }
  return niceScale(min, max, mticks);
}
