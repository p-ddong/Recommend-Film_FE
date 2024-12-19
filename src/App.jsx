import React, { useState } from "react";
import data from "./data/output2.json";
import {
  Box,
  Flex,
  Badge,
  Input,
  Table,
  Button,
  Card,
  VStack,
  Text,
  Center,
  Spinner,
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";

import { Slider } from "./components/ui/slider";
import axios from "axios";

function App() {
  const tags = data;
  const [listTags, setListTags] = useState([...tags]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagObjects, setTagObjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setListTags(tags.filter((tag) => tag.toLowerCase().includes(value)));
  };

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prevSelected) => prevSelected.filter((t) => t !== tag));
      setTagObjects((prevObjects) =>
        prevObjects.filter((obj) => obj.name !== tag)
      );
    } else {
      setSelectedTags((prevSelected) => [...prevSelected, tag]);
      setTagObjects((prevObjects) => [
        ...prevObjects,
        { name: tag, rating: 0 },
      ]);
    }
  };

  const handleRatingChange = (tagName, newRating) => {
    setTagObjects((prevObjects) =>
      prevObjects.map((obj) =>
        obj.name === tagName ? { ...obj, rating: newRating } : obj
      )
    );
  };

  const handleRecommend = async (event) => {
    event.preventDefault();
    const formattedTags = tagObjects.reduce((acc, obj) => {
      acc[obj.name] = obj.rating;
      return acc;
    }, {});

    const payload = {
      tags: formattedTags,
    };

    console.log("payload: ", payload);

    setLoading(true);
    setError(null);

    try {
      const reponse = await axios.post(
        "http://127.0.0.1:5000/recommend/",
        payload
      );
      console.log(reponse.data.recommendations);
      setResponse(reponse.data.recommendations);
      setIsOpen(true)
    } catch (err) {
      console.log(err);
      setError("Error submitting data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      height="100vh"
      gap="20px"
    >
      <Input
        placeholder="Search tags..."
        value={searchTerm}
        onChange={handleSearch}
        width="50%"
        marginBottom="10px"
        color={"white"}
      />

      <Flex gap={6}>
        <Box
          width="700px"
          height="700px"
          border="2px solid #ccc"
          borderRadius="10px"
          padding="16px"
          overflow="auto"
        >
          <Flex flexWrap="wrap" gap="10px">
            {listTags.map((tag, index) => (
              <Badge
                key={index}
                colorPalette={selectedTags.includes(tag) ? "pink" : "gray"}
                padding="5px"
                cursor="pointer"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </Flex>
        </Box>

        <Box
          width="500px"
          height="700px"
          border="2px solid #ccc"
          borderRadius="10px"
          overflow="auto"
          color={"white"}
        >
          <Flex
            margin={2}
            alignItems={"center"}
            justifyContent={"center"}
            gap={2}
          >
            <Button
              onClick={handleRecommend}
              colorPalette={"pink"}
              disabled={tagObjects.length > 0 ? false : true}
            >
              Recommend
            </Button>

            <Button
              onClick={() => {
                setTagObjects([]), setSelectedTags([]);
              }}
              colorPalette={"red"}
            >
              Clear tag
            </Button>

            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
              Result
            </Button>
          </Flex>
          <Table.ScrollArea borderWidth="1px" rounded="md">
            <Table.Root size="sm" stickyHeader>
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader>Tag</Table.ColumnHeader>
                  <Table.ColumnHeader>Rating</Table.ColumnHeader>
                  <Table.ColumnHeader></Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {tagObjects.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>
                      <Slider
                        size="md"
                        width="200px"
                        defaultValue={[item.rating]}
                        min={0}
                        max={100}
                        colorPalette={"pink"}
                        onValueChangeEnd={({ value }) => {
                          handleRatingChange(item.name, value[0] * 0.01);
                        }}
                        marks={[
                          { value: 0, label: "0" },
                          { value: 100, label: "1" },
                        ]}
                      />
                    </Table.Cell>
                    <Table.Cell>{item.rating}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>
      </Flex>

      {/* dialog */}
      <DialogRoot
        size="cover"
        placement="center"
        motionPreset="slide-in-bottom"
        scrollBehavior="inside"
        open={isOpen}
      >
        <DialogContent color="white">
          <DialogHeader>
            <DialogTitle>Recommendations</DialogTitle>
            <DialogCloseTrigger onClick={() => setIsOpen(false)} />
          </DialogHeader>
          <DialogBody>
            <Flex
              wrap={"wrap"}
              justifyContent="flex-start"
              gap={6}
              paddingLeft={10}
            >
              {response.map((item, index) => (
                <Card.Root
                  flexDirection="row"
                  overflow="hidden"
                  maxW="xl"
                  key={index}
                  width={"300px"}
                  // height={"300px"}
                  position={"relative"}
                >
                  <Box>
                    <Card.Body >
                      <Card.Title mb="2">{item.title}</Card.Title>
                      <Text>Tags :</Text>
                      <Flex mt={2} flexDirection={'column'} gap={1}>
                        {Object.entries(item.tags).map(([key, value], idx) => (
                          <Badge key={idx} colorPalette={"pink"}>
                            {key}: {value.toFixed(2)}
                          </Badge>
                        ))}
                      </Flex>
                    </Card.Body>
                    <Card.Footer
                      display={"flex"}
                      flexDirection={"column"}
                      alignItems={'start'}
                    >
                      <Text>Similarity:</Text>
                      <Text>{item.similarity}</Text>{" "}
                    </Card.Footer>
                  </Box>
                </Card.Root>
              ))}
            </Flex>
          </DialogBody>
        </DialogContent>
      </DialogRoot>

      <Box pos="absolute" inset="0" bg="bg/80" hidden={!loading}>
        <Center h="full">
          <Spinner color="teal.500" />
        </Center>
      </Box>
    </Flex>
  );
}

export default App;
