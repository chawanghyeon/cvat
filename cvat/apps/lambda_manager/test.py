# 오토라벨링에 표시될 라바 모델 정보
llava = {
    "id": "llava",
    "kind": "detector",
    "labels": ["any"],
    "labels_v2": [
        {
            "name": "any",
            "type": "rectangle",
            "attributes": [
                {"name": "age", "input_type": "number", "values": ["0", "150", "1"]},
                {
                    "name": "gender",
                    "input_type": "select",
                    "values": ["female", "male"],
                },
                {
                    "name": "emotion",
                    "input_type": "select",
                    "values": ["neutral", "happy", "sad", "surprise", "anger"],
                },
            ],
        }
    ],
    "description": "Detection network finding faces and defining age, gender and emotion attributes",
    "framework": "openvino",
    "name": "llava",
    "version": 1,
    "attributes": {
        "any": [
            {"name": "age", "input_type": "number", "values": ["0", "150", "1"]},
            {"name": "gender", "input_type": "select", "values": ["female", "male"]},
            {
                "name": "emotion",
                "input_type": "select",
                "values": ["neutral", "happy", "sad", "surprise", "anger"],
            },
        ]
    },
}
