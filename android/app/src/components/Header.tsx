import React from "react";

import {
    View,
    Text,
    StyleSheet
} from "react-native";

export default function Header() {

    return (

        <View style={styles.container}>

            <View style={styles.titleBlock}>

                <Text style={styles.title}>

                    RADARSUR

                </Text>

                <Text style={styles.subtitle}>

                    Sistema Inteligente de Búsqueda

                </Text>

            </View>

            <View style={styles.statusContainer}>

                <View style={styles.dot}/>

                <Text style={styles.online}>

                    ONLINE

                </Text>

            </View>

        </View>

    );

}

const styles = StyleSheet.create({

    container:{
        paddingHorizontal:16,
        paddingVertical:14,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        borderBottomWidth:1,
        borderBottomColor:"#2C3746",
        backgroundColor:"#111827"
    },

    titleBlock:{
        flex:1,
        marginRight:12
    },

    title:{
        color:"#00FF88",
        fontSize:24,
        fontWeight:"700"
    },

    subtitle:{
        color:"#A5B4C3",
        marginTop:4,
        fontSize:12
    },

    statusContainer:{
        flexDirection:"row",
        alignItems:"center",
        flexShrink:0
    },

    dot:{
        width:10,
        height:10,
        borderRadius:5,
        backgroundColor:"#00FF88",
        marginRight:8
    },

    online:{
        color:"#00FF88",
        fontWeight:"600"
    }

});
