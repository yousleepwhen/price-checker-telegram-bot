module.exports.numberWithCommas= function(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports.getKeySymbol = function(marketName, separator){
    let keys = marketName.split(separator)
    return keys[0]
}

module.exports.getChange = function(current, prev, fixed = 2){
    return (current / prev* 100.0 - 100.0).toFixed(fixed)
}

module.exports.getHowManyEmoji = (v) => {
  const emoji = v < 0.0 ? '😭' : '🤑';
  if(Math.abs(v) >= 0 && 9.999 > Math.abs(v) ){
    return emoji
  }
  else if(Math.abs(v) >= 10 && 19.999 > Math.abs(v)){
    return emoji + emoji
  }
  else if(Math.abs(v) > 20.0)
    return emoji + emoji + "🔥"
  else
    return "UNKNOWN"
}
