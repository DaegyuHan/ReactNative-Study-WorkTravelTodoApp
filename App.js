import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, ActivityIndicator} from 'react-native';
import React, {useState, useEffect} from "react";
import {theme} from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@toDos"

export default function App() {
    const [working, setWorking] = useState(true);
    const [text, setText] = useState("");
    const [toDos, setToDos] = useState({})
    const travel = () => setWorking(false);
    const work = () => setWorking(true);
    const onChangeText = (payload) => setText(payload)
    const saveToDos = async (toSave) => {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    }
    const loadToDos = async () => {
        const s = await AsyncStorage.getItem(STORAGE_KEY);
        setToDos(JSON.parse(s))
    }
    useEffect(() => {
        loadToDos();
    }, []);
    const addTodo = async () => {
        if (text === "") {
            return;
        }
        // save todo
        const newToDos = {
            ...toDos, [Date.now()]: {text, working: working},
        };
        setToDos(newToDos)
        await saveToDos(newToDos)
        setText("");
        console.log(toDos)
    }

    return (
        <View style={styles.container}>
            <StatusBar style="auto"/>
            <View style={styles.header}>
                <TouchableOpacity onPress={work}>
                    <Text style={{...styles.btnText, color: working ? "white" : theme.gray}}>Work</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={travel}>
                    <Text style={{...styles.btnText, color: !working ? "white" : theme.gray}}>Travel</Text>
                </TouchableOpacity> </View>
            <View>
                <TextInput
                    onSubmitEditing={addTodo}
                    returnKeyType={"done"}
                    value={text}
                    onChangeText={onChangeText}
                    placeholder={working ? "Add a To Do" : "Where do you wannt to go?"}
                    style={styles.textInput}/>
                <ScrollView>{
                    Object.keys(toDos).map(key =>
                        toDos[key].working === working ? (
                        <View style={styles.toDo} key={key}>
                            <Text style={styles.toDoText}>{toDos[key].text}</Text>
                        </View>
                        ) : null
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.bg,
        paddingHorizontal: 20,
    },
    header: {
        justifyContent: "space-between",
        flexDirection: "row",
        marginTop: 100,
    },
    btnText: {
        fontSize: 38,
        fontWeight: "600",
    },
    textInput: {
        backgroundColor: "white",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginVertical: 20,
        fontSize: 18,
    },
    toDo: {
        backgroundColor: theme.gray,
        marginBottom: 10,
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 15,
    },
    toDoText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    }
});
