import {StatusBar} from 'expo-status-bar';
import {Keyboard, TouchableWithoutFeedback} from "react-native";
import {ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from "react";
import {theme} from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Fontisto from '@expo/vector-icons/Fontisto';

const STORAGE_KEY_TODO = "@toDos"
const STORAGE_KEY_MENU = "@menu"

export default function App() {
    const [working, setWorking] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [text, setText] = useState("");
    const [toDos, setToDos] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState(null);
    const [editText, setEditText] = useState("");
    const travel = async () => {
        setWorking(false);
        await saveMenu(false)
    };
    const work = async () => {
        setWorking(true);
        await saveMenu(true);
    }
    const saveMenu = async (isWorking) => {
        await AsyncStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(isWorking))
    }
    const loadMenuState = async () => {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY_MENU);
        if (savedState !== null) {
            setWorking(JSON.parse(savedState));
        }
    }
    const onChangeText = (payload) => setText(payload)
    const saveToDos = async (toSave) => {
        await AsyncStorage.setItem(STORAGE_KEY_TODO, JSON.stringify(toSave))
    }
    const loadToDos = async () => {
        setLoading(true);
        const s = await AsyncStorage.getItem(STORAGE_KEY_TODO);
        if (s) {
            setToDos(JSON.parse(s))
        }
        setLoading(false)
    }
    useEffect(() => {
        loadToDos();
        loadMenuState();
    }, []);
    const addTodo = async () => {
        if (text === "") {
            return;
        }
        const newToDos = {
            ...toDos, [Date.now()]: {text, working: working, isCompleted: isCompleted},
        };
        setToDos(newToDos)
        await saveToDos(newToDos)
        setText("");
        console.log(toDos)
    }
    const deleteToDo = async (key) => {
        Alert.alert("Delete To Do?", "Are you sure?", [
                {
                    text: "Ok",
                    onPress: () => {
                        const newToDos = {...toDos}
                        delete newToDos[key]
                        setToDos(newToDos);
                        saveToDos(newToDos);
                    }
                },
                {
                    text: "Cancel", style: "destructive"
                }
            ]
        )
    }
    const editToDo = (key, currentText) => {
        setEditingKey(key);
        setEditText(currentText);
        console.log(key, currentText)
    }
    const saveEdit = async () => {
        if (editText.trim() === "") return;
        const updatedToDos = {
            ...toDos,
            [editingKey]: {...toDos[editingKey], text: editText}
        };
        setToDos(updatedToDos);
        await saveToDos(updatedToDos);
        setEditingKey(null);
        setEditText("");
    };
    const updateToDos = async (key) => {
        const updatedToDos = {
            ...toDos,
            [key]: {...toDos[key], isCompleted: !toDos[key].isCompleted}
        }
        setToDos(updatedToDos);
        await saveToDos(updatedToDos);
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <StatusBar style="auto"/>
                <View style={styles.header}>
                    <TouchableOpacity onPress={work}>
                        <Text style={{...styles.btnText, color: working ? "white" : theme.toDoBg}}>Work</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={travel}>
                        <Text style={{...styles.btnText, color: !working ? "white" : theme.toDoBg}}>Travel</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <TextInput
                        onSubmitEditing={addTodo}
                        returnKeyType={"done"}
                        value={text}
                        onChangeText={onChangeText}
                        placeholder={working ? "Add a To Do" : "Where do you wannt to go?"}
                        style={styles.textInput}
                    />
                    {
                        loading ? (
                            <ActivityIndicator size="large" color="white" style={styles.loading}/>
                        ) : (
                            <ScrollView>
                                {
                                    Object.keys(toDos).map(key =>
                                        toDos[key].working === working ? (
                                            <View style={styles.toDo} key={key}>
                                                {editingKey === key ? (
                                                    <TextInput
                                                        value={editText}
                                                        onChangeText={setEditText}
                                                        onSubmitEditing={saveEdit}
                                                        style={styles.editInput}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <Text
                                                        style={[
                                                            styles.toDoText,
                                                            toDos[key].isCompleted && {
                                                                textDecorationLine: "line-through",
                                                                color: "gray"
                                                            }
                                                        ]}
                                                    >
                                                        {toDos[key].text}
                                                    </Text>
                                                )}
                                                <View style={styles.btnContainer}>
                                                    <TouchableOpacity onPress={() => updateToDos(key)}>
                                                        <Fontisto name="check" size={18}
                                                                  color={toDos[key].isCompleted ? "gray" : theme.toDoBg}/>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => editToDo(key, toDos[key].text)}>
                                                        <Fontisto name="commenting" size={18} color={theme.toDoBg}/>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                                                        <Fontisto name="trash" size={18} color={theme.toDoBg}/>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : null
                                    )}
                            </ScrollView>
                        )
                    }
                </View>
            </View>
        </TouchableWithoutFeedback>
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
        backgroundColor: theme.bg,
        marginBottom: 10,
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    toDoText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
    loading: {
        marginTop: 20,
    },
    btnContainer: {
        flexDirection: "row",
        gap: 10,
    },
    editInput: {
        backgroundColor: "white",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        fontSize: 16,
        flex: 0.8,
    },
});
