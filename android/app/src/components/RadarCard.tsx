import React from "react";

import {

View,

Text,

StyleSheet

} from "react-native";

interface Props{

title:string;

value:string|number;

}

export default function RadarCard({

title,

value

}:Props){

return(

<View style={styles.card}>

<Text style={styles.title} numberOfLines={1}>

{title}

</Text>

<Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>

{value}

</Text>

</View>

);

}

const styles=StyleSheet.create({

card:{

backgroundColor:"#1F2937",

padding:14,

borderRadius:12,

minHeight:78,

borderWidth:1,

borderColor:"#2C3746"

},

title:{

color:"#9CA3AF",

fontSize:14

},

value:{

marginTop:6,

fontSize:20,

fontWeight:"700",

color:"#00FF88"

}

});
