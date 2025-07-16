from neo4j import GraphDatabase
from main.config import Config
import logging
from datetime import datetime
# StructuredNode, StringProperty, RelationshipTo, RelationshipFrom, config, db, IntegerProperty, UniqueIdProperty,

class neo4jConnector(object):

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            print('Creating the object')
            cls._instance = super(neo4jConnector, cls).__new__(cls)
            cls.driver = GraphDatabase.driver(Config.NEO4J_URI, auth=(
                Config.NEO4J_USER, Config.NEO4J_PASSWORD))
        return cls._instance
    

    def close(self):
        self.driver.close()

    def run_query(self, query):
        with self.driver.session() as session:
            result = session.run(query)
        return list(result)

    @staticmethod
    def _run_query(tx, query):
        result = tx.run(query)
        return list(result)

    def run_Cypher_query(self, query):
        with self.driver.session() as session:
            result = session.write_transaction(self._run_Cypher_query, query)
        return list(result)

    @staticmethod
    def _run_Cypher_query(tx, query):
        result = tx.run(query)
        return list(result)

    def create_node(self, node_variable, node_label,
                    node_properties):  # TODO: make sure te graph does not already contain the node.
        with self.driver.session() as session:
            new_node = session.write_transaction(
                self._create_new_node, node_variable, node_label, node_properties)

    @staticmethod
    def _create_new_node(tx, node_variable, node_label, node_properties):
            try:
                cypher_query = "CREATE ({}:{} $node_properties)".format(
                    node_variable, node_label)
                tx.run(cypher_query, node_properties=node_properties)
            except Exception as ex:
                logging.error(ex)


    def create_cluster(self, cluster_embedding):  
        with self.driver.session() as session:
            new_node = session.write_transaction(
                self._create_cluster, cluster_embedding)
            return new_node

    @staticmethod
    def _create_cluster(tx, cluster_embedding):
            try:
                cypher_query = "MATCH (c:Centroid ) "+\
                               "WITH MAX(c.cluster) as max_cluster "+\
                               "CREATE (c:Centroid {cluster: max_cluster+1, dimension: 512, embedding:"+str(cluster_embedding)+", method: 'distiluse-base-multilingual-cased-v1'}) "+\
                               "RETURN c.cluster as cluster,c.embedding as embedding "
                result = tx.run(cypher_query)
                return list(result)
            except Exception as ex:
                logging.error(ex)


    def update_embedding_cluster(self, cluster_number):  
        with self.driver.session() as session:
            new_node = session.write_transaction(
                self._update_embedding_cluster, cluster_number)
            return new_node

    @staticmethod
    def _update_embedding_cluster(tx, cluster_number):
            try:
                cypher_query = "MATCH (u {cluster_number: +"+str(cluster_number)+"}) "+\
                               "WHERE u:Journey OR u:Course OR u:Educational_Package OR u:Topic OR u:OER "+\
                               "WITH u.cluster_number AS cluster, u, range(0, 512) AS ii  "+\
                               "UNWIND ii AS i "+\
                               "WITH cluster, i, avg(u.`embedding`[i]) AS avgVal "+\
                               "ORDER BY cluster, i "+\
                               "WITH cluster, collect(avgVal) AS avgEmbeddings "+\
                               "MATCH (c:Centroid {cluster: "+str(cluster_number)+"}) "+\
                               "SET c.embedding = avgEmbeddings "+\
                               "RETURN c;"
                result = tx.run(cypher_query)
                return list(result)
            except Exception as ex:
                logging.error(ex)

    

    def create_relation(self, source_node_matching_type, source_node_matching_property, source_node_matching_value,
                        target_node_matching_type, target_node_matching_property, target_node_matching_value,
                        relation_variable, relation_type, relation_properties):
        with self.driver.session() as session:
            new_relation = session.write_transaction(self._create_new_relation, source_node_matching_type,
                                                     source_node_matching_property, source_node_matching_value,
                                                     target_node_matching_type, target_node_matching_property,
                                                     target_node_matching_value, relation_variable, relation_type,
                                                     relation_properties)

    @staticmethod
    def _create_new_relation(tx, source_node_matching_type, source_node_matching_property, source_node_matching_value,
                             target_node_matching_type, target_node_matching_property, target_node_matching_value,
                             relation_variable, relation_type, relation_properties):
        try:
            cypher_query = "MATCH (source_node:" + str(source_node_matching_type) + " {" + \
                        str(source_node_matching_property) + ": " + str(source_node_matching_value) + \
                        "}) MATCH (target_node:" + str(target_node_matching_type) + " {" + \
                        str(target_node_matching_property) + ": " + str(target_node_matching_value) + \
                        "}) CREATE (source_node)-[" + str(relation_variable) + ":" + str(relation_type) + \
                        " $relation_properties]->(target_node)"
            tx.run(cypher_query, relation_properties=relation_properties)
        except Exception as ex:
            logging.error(ex)



    def delete_duplicate_nodes_from_titles(self, node_type):
        with self.driver.session() as session:
            result = session.read_transaction(
                self._delete_duplicate_nodes_from_titles, node_type)
        return result

    @staticmethod
    def _delete_duplicate_nodes_from_titles(tx, node_type):
        cypher_query = "MATCH (n:" + node_type + ") WITH n.title as titles, collect(n) AS nodes" + \
                       "WHERE size(nodes) > 1 FOREACH (n in tail(nodes) | DETACH DELETE n)"
        tx.run(cypher_query)

    def set_node_property(self, node_matching_type, node_matching_property, matching_property_value, property_to_set,
                          property_to_set_value):
        with self.driver.session() as session:
            result = session.write_transaction(self._set_node_property, node_matching_type, node_matching_property,
                                              matching_property_value, property_to_set, property_to_set_value)
        return result

    @staticmethod
    def _set_node_property(tx, node_matching_type, node_matching_property, matching_property_value, property_to_set,
                           property_to_set_value):
        try:
            cypher_query = "MATCH (n:" + str(node_matching_type) + " {" + str(node_matching_property) + ": '" + \
                        str(matching_property_value) + "'}) SET n." + str(property_to_set) + \
                        " = \'" + property_to_set_value + "\'"
            tx.run(cypher_query)
        except Exception as e:
            logging.error(e)


    def set_title_description_embedding(self, node_type):
        with self.driver.session() as session:
            result = session.read_transaction(
                self._set_title_description_embedding, node_type)
        return result

    @staticmethod
    def _set_title_description_embedding(tx, node_type):
        cypher_query = ""
        tx.run(cypher_query)

    def find_node(self, node_matching_type, node_matching_property, node_matching_value):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_node, node_matching_type, node_matching_property,
                                              node_matching_value)
        return result

    @staticmethod
    def _find_node(tx, node_matching_type, node_matching_property, node_matching_value):
        # no node type, not matching property, multiple matching properties.
        # + error handling (missing value for property, wrong type/property/property_value_type, )
        if node_matching_type is None:
            node_matching_type = ''
        if node_matching_property is None:
            node_matching_property = ''
        if str(node_matching_property) != '':
            _node_matching_criterion = str(
                node_matching_property) + ": '" + str(node_matching_value) + "'"
        else:
            _node_matching_criterion = ''

        cypher_query = "MATCH (found_node:" + str(node_matching_type) + " {" + \
                       _node_matching_criterion + "}) RETURN(found_node)"
        result = tx.run(cypher_query)
        return list(result)

    def find_node_by_id(self, node_matching_type, node_matching_value):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_node_by_id, node_matching_type,
                                              node_matching_value)
        return result

    @staticmethod
    def _find_node_by_id(tx, node_matching_type, node_matching_value):
        try:
            cypher_query = "MATCH (found_node:" + str(node_matching_type) + " {" + \
                " ID: " + str(node_matching_value) + "}) RETURN(found_node)"
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)

    def delete_node_by_property(self, node_matching_type, node_property_name,  node_property_value):
        with self.driver.session() as session:
            result = session.write_transaction(self._delete_node_by_property, node_matching_type,
                                              node_property_name, node_property_value)
        return result

    @staticmethod
    def _delete_node_by_property(tx, node_matching_type, node_property_name, node_property_value):
        try:
            cypher_query = "MATCH (found_node:" + str(node_matching_type) + " {" + \
                str(node_property_name)+": " + str(node_property_value) + "}) DETACH DELETE found_node"
            tx.run(cypher_query)
        except Exception as e:
            logging.error(e)


    def find_C_orT_node(self, node_matching_property, node_matching_value):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_C_orT_node, node_matching_property,
                                              node_matching_value)
        return result

    @staticmethod
    def _find_C_orT_node(tx, node_matching_property, node_matching_value):
        # no node type, not matching property, multiple matching properties.
        # + error handling (missing value for property, wrong type/property/property_value_type, )
        if node_matching_property is None:
            node_matching_property = ''
        if str(node_matching_property) != '':
            _node_matching_criterion = str(
                node_matching_property) + ": '" + str(node_matching_value) + "'"
        else:
            _node_matching_criterion = ''

        cypher_query = "MATCH (found_node {" + _node_matching_criterion + "})" + \
                       "WHERE found_node:Course OR found_node:Topic " + \
                       "RETURN(found_node)"
        result = tx.run(cypher_query)
        return list(result)

    def find_relation(self, source_node_matching_type, source_node_matching_property, source_node_matching_value,
                      target_node_matching_type, target_node_matching_property, target_node_matching_value,
                      relation_matching_type, relation_matching_property,
                      relation_matching_value):  # TODO extend for multiple matching proeprties
        with self.driver.session() as session:
            session.write_transaction(self._find_relation, source_node_matching_type, source_node_matching_property,
                                      source_node_matching_value, target_node_matching_type,
                                      target_node_matching_property, target_node_matching_value,
                                      relation_matching_type, relation_matching_property, relation_matching_value)

    @staticmethod
    def _find_relation(tx, source_node_matching_type, source_node_matching_property, source_node_matching_value,
                       target_node_matching_type, target_node_matching_property, target_node_matching_value,
                       relation_matching_type, relation_matching_property, relation_matching_value):
        cypher_query = "MATCH (s:" + str(source_node_matching_type) + " {" + \
                       str(source_node_matching_property) + ": " + str(source_node_matching_value) + "})" + \
                       "-[relat:" + str(relation_matching_type) + " {" + str(relation_matching_property) + ": " + \
                       str(relation_matching_value) + "}]->(t:" + str(target_node_matching_type) + " {" + \
                       str(target_node_matching_property) + ": " + \
            str(target_node_matching_value) + "}) RETURN(relat)"
        result = tx.run(cypher_query)
        return list(result)


    def find_all_relations(self, source_node_matching_type, source_node_matching_id,
                      target_node_matching_type, target_node_matching_id):
        with self.driver.session() as session:
            results = session.write_transaction(self._find_all_relations, source_node_matching_type, source_node_matching_id,
                                    target_node_matching_type, target_node_matching_id)
            return results

    @staticmethod
    def _find_all_relations(tx, source_node_matching_type, source_node_matching_id,
                      target_node_matching_type, target_node_matching_id):
        cypher_query = "MATCH (s:" + str(source_node_matching_type) + " { ID: " + \
                        str(source_node_matching_id) + " })" + \
                        "-[r]-(t:" + str(target_node_matching_type) + " { ID: " + \
                        str(target_node_matching_id) + " }) RETURN(r)"
        result = tx.run(cypher_query)
        return list(result)


    
    def find_all_node_relations(self, node_id, node_type):
        with self.driver.session() as session:
            results = session.write_transaction(self._find_all_node_relations, node_id, node_type)
            return results    

    @staticmethod
    def _find_all_node_relations(tx, node_id, node_type):
        cypher_query = "MATCH (n)-[r]-(target) " + \
                        "WHERE n.ID = " + str(node_id) +  " RETURN DISTINCT n, r, target"
        print("cypher query", cypher_query)                       
        result = tx.run(cypher_query)
        return list(result)


    def find_connected_courses(self, course_name):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_connected_courses, course_name)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_connected_courses(tx, course_name):
        cypher_query = "MATCH (:Course {title: '" + str(course_name) + "'})-[]-(found_node: Course)" + \
                       "RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)

    def find_connected_courses_with_ID(self, course_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_connected_courses_with_ID, course_ID)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_connected_courses_with_ID(tx, course_ID):
        cypher_query = "MATCH (:Course {ID: " + str(course_ID) + "})-[]-(found_node: Course)" + \
                       "RETURN found_node.ID AS course_ID"
        results = tx.run(cypher_query)
        return list(results)

    def find_connected_topics(self, topic_name):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_connected_topics, topic_name)
        return results

    @staticmethod
    def _find_connected_topics(tx, topic_name):
        cypher_query = "MATCH (:Topic {title: '" + str(topic_name) + "'})-[]->(found_node: Topic)" + \
                       "RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)

    def find_connected_educational_packages(self, educational_package_name):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_connected_educational_packages, educational_package_name)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_connected_educational_packages(tx, educational_package_name):
        cypher_query = "MATCH (:Educational_Package {title: '" + str(educational_package_name) + "'})-[]-(found_node: Educational_Package)" + \
                       "RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)

    def find_connected_oers(self, oer_name):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_connected_oers, oer_name)
        return results

    @staticmethod
    def _find_connected_oers(tx, oer_name):
        cypher_query = "MATCH (:OER {title: '" + str(oer_name) + "'})-[]->(found_node: OER)" + \
                       "RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)

    def find_connected_oer_groups(self, oer_group_name):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_connected_oer_groups, oer_group_name)
        return results

    @staticmethod
    def _find_connected_oer_groups(tx, oer_group_name):
        cypher_query = "MATCH (:OER_Group {title: '" + str(oer_group_name) + "'})-[]->(found_node: OER_Group)" + \
                       "RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)

    def node_not_exist_full_properties(self, object_type, object_properties):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._node_not_exist_full_properties, object_type, object_properties)
        return results

    @staticmethod
    def _node_not_exist_full_properties(tx, object_type, object_properties):
        if object_type == 'Journey':
            cypher_query = "OPTIONAL MATCH (j:Journey {title: '" + str(object_properties['title']) + \
                           "', description: '" + str(object_properties['description']) + \
                           "', created_at: '" + str(object_properties['created_at']) + \
                           "', industry: '" + str(object_properties['industry']) + \
                           "', company: '" + str(object_properties['company']) + \
                           "', country: '" + str(object_properties['country']) + \
                           "'}) RETURN j IS NOT NULL AS Predicate"

        elif object_type == 'Course':
            cypher_query = "OPTIONAL MATCH (c:Course {title: '" + str(object_properties['title']) + \
                           "', description: '" + str(object_properties['description']) + \
                           "', created_at: '" + str(object_properties['created_at']) + \
                           "', learnable: '" + str(object_properties['learnable']) + \
                           "', assessmentable: '" + str(object_properties['assessmentable']) + \
                           "', addable: '" + str(object_properties['addable']) + \
                           "'}) RETURN c IS NOT NULL AS Predicate"

        elif object_type == 'Topic':
            cypher_query = "OPTIONAL MATCH (t:Topic {title: '" + str(object_properties['title']) + \
                           "', description: '" + str(object_properties['description']) + \
                           "', created_at: '" + str(object_properties['created_at']) + \
                           "', learnable: '" + str(object_properties['learnable']) + \
                           "', assessmentable: '" + str(object_properties['assessmentable']) + \
                           "', language: '" + str(object_properties['language']) + \
                           "'}) RETURN t IS NOT NULL AS Predicate"

        elif object_type == 'Educational_Package':
            cypher_query = "OPTIONAL MATCH (ep:Educational_Package {title: '" + str(object_properties['title']) + \
                           "', description: '" + str(object_properties['description']) + \
                           "', created_at: '" + str(object_properties['created_at']) + \
                           "'}) RETURN ep IS NOT NULL AS Predicate"

        elif object_type == 'OER':
            cypher_query = "OPTIONAL MATCH (o:OER {title: '" + str(object_properties['title']) + \
                           "', description: '" + str(object_properties['description']) + \
                           "', created_at: '" + str(object_properties['created_at']) + \
                           "', url: '" + str(object_properties['url']) + \
                           "'}) RETURN o IS NOT NULL AS Predicate"

        result = tx.run(cypher_query)
        return result

    def node_exist(self, object_type, object_properties):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._node_exist, object_type, object_properties)
        results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _node_exist(tx, object_type, object_properties):
        if object_type == 'Journey':
            cypher_query = "OPTIONAL MATCH (j:Journey {ID: " + str(object_properties['ID']) + \
                           "}) RETURN j IS NOT NULL AS Predicate"

        elif object_type == 'Course':
            cypher_query = "OPTIONAL MATCH (c:Course {ID: " + str(object_properties['ID']) + \
                           "}) RETURN c IS NOT NULL AS Predicate"

        elif object_type == 'Topic':
            cypher_query = "OPTIONAL MATCH (t:Topic {ID: " + str(object_properties['ID']) + \
                           "}) RETURN t IS NOT NULL AS Predicate"

        elif object_type == 'Educational_Package':
            cypher_query = "OPTIONAL MATCH (ep:Educational_Package {ID: " + str(object_properties['ID']) + \
                           "}) RETURN ep IS NOT NULL AS Predicate"

        elif object_type == 'OER':
            cypher_query = "OPTIONAL MATCH (o:OER {ID: " + str(object_properties['ID']) + \
                           "}) RETURN o IS NOT NULL AS Predicate"

        result = tx.run(cypher_query)
        return list(result)

    def relation_exist(self, source_type, source_property, source_property_value, relation_type,
                       target_type, target_property, target_property_value):
        with self.driver.session() as session:
            results = session.read_transaction(self._relation_exist, source_type, source_property,
                                               source_property_value, relation_type,
                                               target_type, target_property, target_property_value)
        results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _relation_exist(tx, source_type, source_property, source_property_value, relation_type,
                        target_type, target_property, target_property_value):
        cypher_query = "OPTIONAL MATCH (S:" + str(source_type) + " {" + str(source_property) + ": " + \
                       str(source_property_value) + "})-[r:" + str(relation_type) + "]-(T:" + str(target_type) + \
                       " {" + str(target_property) + ": " + str(target_property_value) + "})" + \
                       " RETURN r IS NOT NULL AS Predicate"

        result = tx.run(cypher_query)
        return list(result)

    def gds_project_graph(self, object_type):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._gds_project_graph, object_type)
        return results

    @staticmethod
    def _gds_project_graph(tx, object_type):
        cypher_query = "CALL gds.graph.project('myGraph', " + object_type + \
                       ", 'has_semantic_relation_to', {nodeProperties: 'ID'})"

        result = tx.run(cypher_query)
        return result

    def calculate_and_add_node_communities(self):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._calculate_and_add_node_communities)
        return results

    @staticmethod
    def _calculate_and_add_node_communities(tx):
        cypher_query = "CALL gds.labelPropagation.write('myGraph', {writeProperty: 'community'}) " + \
                       "YIELD communityCount, ranIterations, didConverge"

        result = tx.run(cypher_query)
        return result

    def calculate_and_add_node_betweenness(self):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._calculate_and_add_node_communities)
        return results

    @staticmethod
    def _calculate_and_add_node_betweenness(tx):
        cypher_query = "CALL gds.labelPropagation.write('myGraph', {writeProperty: 'community'}) " + \
                       "YIELD communityCount, ranIterations, didConverge"

        result = tx.run(cypher_query)
        return result

    def calculate_and_add_node_closeness(self):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._calculate_and_add_node_communities)
        return results

    @staticmethod
    def _calculate_and_add_node_closeness(tx):
        cypher_query = "CALL gds.labelPropagation.write('myGraph', {writeProperty: 'community'}) " + \
                       "YIELD communityCount, ranIterations, didConverge"

        result = tx.run(cypher_query)
        return result

    def find_all_paths(self, source_node_type, source_node_ID, target_node_type, target_node_ID, relation_types,
                       path_min_length, path_max_length):
        with self.driver.session() as session:
            results = session.read_transaction(self._find_all_paths, source_node_type, source_node_ID,
                                               target_node_type, target_node_ID, relation_types,
                                               path_min_length, path_max_length)
        return results

    @staticmethod
    def _find_all_paths(tx, source_node_type, source_node_ID, target_node_type, target_node_ID, relation_types,
                        path_min_length, path_max_length):  # types should have an '|' operator among them if they are more than one.
        cypher_query = "MATCH " + \
                       "(n:" + source_node_type + " {ID: " + str(source_node_ID) + "}), " \
                       "(n1:" + target_node_type + " {ID: " + str(target_node_ID) + "}), " \
                       "p = (n)-[:" + relation_types + "*" + str(path_min_length) + ".." + str(path_max_length) + "]-(n1) " \
                       "RETURN [nodes(p), relationships(p)]"
        results = tx.run(cypher_query)
        return list(results)

    def find_J_paths(self, target_node_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_J_paths, target_node_ID)
        return results

    @staticmethod
    # types should have an '|' operator among them if they are more than one.
    def _find_J_paths(tx, target_node_ID):
        cypher_query = "match p=(j:Journey {ID: " + str(target_node_ID) + \
                       "})-[:has_course]->(c:Course) " \
                       "RETURN [nodes(p), relationships(p)] "

        results = tx.run(cypher_query)
        return list(results)

    def project_graph(self, projected_graph_name, projected_nodes, projected_relations):
        with self.driver.session() as session:
            results = session.read_transaction(self._project_graph, projected_graph_name, projected_nodes,
                                               projected_relations)  # projected nodes and relations should e a list if they are more than one.
        return results

    @staticmethod
    def _project_graph(tx, projected_graph_name, projected_nodes, projected_relations):
        cypher_query = "CALL gds.graph.project('" + projected_graph_name + "', " + projected_nodes + ", " + \
                       + projected_relations + ")"

        result = tx.run(cypher_query)
        return result

    def is_course_of_journey(self, course_ID, journey_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._is_course_of_journey, course_ID, journey_ID)
        return [dict(i) for i in results]

    @staticmethod
    def _is_course_of_journey(tx, course_ID, journey_ID):
        cypher_query = "OPTIONAL MATCH p=(c:Course {ID: " + str(course_ID) + "})-[r:has_course]-(j:Journey {ID: " \
                       + str(journey_ID) + \
            "}) RETURN p IS NOT NULL AS Predicate"

        result = tx.run(cypher_query)
        return result

    def is_connected_to_journey_course(self, course_ID, journey_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._is_connected_to_journey_course, course_ID, journey_ID)
        results_dict = [dict(i) for i in results]
        if len(results_dict) > 1:
            return True
        else:
            return False

    @staticmethod
    def _is_connected_to_journey_course(tx, course_ID, journey_ID):
        cypher_query = "OPTIONAL MATCH p=((c1:Course {ID: " + str(course_ID) + "})-[r1:has_semantic_relation_to]" \
            "-(c2:Course)-[r2:has_course]-(j:Journey {ID: " + str(journey_ID) + "})) " \
            "RETURN p IS NOT NULL AS Predicate"

        result = tx.run(cypher_query)
        return result

    def get_course_course_journey_avg_sim_score(self, course_ID, journey_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._get_course_course_journey_avg_sim_score, course_ID, journey_ID)
        results_dicts = [dict(i) for i in results]
        if len(results_dicts) > 0:
            return sum([res_dict['sim_score'] for res_dict in results_dicts])/len(results_dicts)
        else:
            return False

    @staticmethod
    def _get_course_course_journey_avg_sim_score(tx, course_ID, journey_ID):
        cypher_query = "OPTIONAL MATCH p=((c1:Course {ID: " + str(course_ID) + "})-[r1:has_semantic_relation_to]" \
            "-(c2:Course)-[r2:has_course]-(j:Journey {ID: " + str(journey_ID) + "})) " \
            "RETURN p IS NOT NULL AS Predicate, r1.title_similarity_score AS sim_score"

        result = tx.run(cypher_query)
        return result

    def find_all_nodes_of_type(self, node_type):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_all_nodes_of_type, node_type)
        results_dicts = [dict(i)['title'] for i in results]
        return results_dicts

    @staticmethod
    def _find_all_nodes_of_type(tx, node_type):
        cypher_query = "MATCH (n:" + node_type + ") RETURN n.title As title"
        result = tx.run(cypher_query)
        return list(result)

    def get_node_titles(self, node_type):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_all_nodes_of_type, node_type)
        results_dicts = [dict(i)['title'] for i in results]
        return results_dicts

    @staticmethod
    def _get_node_titles(tx, node_type):
        cypher_query = "MATCH (n:" + node_type + ") RETURN n.title As title"
        result = tx.run(cypher_query)
        return list(result)

    def find_educational_packages_of_topic(self, topic_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_educational_packages_of_topic, topic_ID)
        return results

    @staticmethod
    def _find_educational_packages_of_topic(tx, topic_ID):
        cypher_query = "MATCH (:Topic {ID: " + str(topic_ID) + "})-[:has_educational_package]->(found_node:Educational_Package)" + \
                       " RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)

    def find_courses_of_journey(self, journey_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_courses_of_journey, journey_ID)
        return results

    @staticmethod
    def _find_courses_of_journey(tx, journey_ID):
        cypher_query = "MATCH (:Journey {ID: " + str(journey_ID) + "})-[:has_course]->(found_node:Course)" + \
                       " RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)

    def find_course_by_id(self, course_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_course_by_id, course_ID)
        return results

    @staticmethod
    def _find_course_by_id(tx, course_ID):
        cypher_query = "MATCH (c:Course {ID: " + str(course_ID) + "}) " + \
                       " RETURN(c)"
        results = tx.run(cypher_query)
        return list(results)

    def find_topics_of_course(self, course_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_topics_of_course, course_ID)
        return results

    @staticmethod
    def _find_topics_of_course(tx, course_ID):
        cypher_query = "MATCH (:Course {ID: " + str(course_ID) + "})-[:has_topic]->(found_node:Topic)" + \
                       " RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)

    def find_all_topics(self):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_all_topics)
        return results
# Remoon
# return t to access all topic properties
    @staticmethod
    def _find_all_topics(tx):
        cypher_query = "MATCH (t:Topic) RETURN t"
        results = tx.run(cypher_query)
        return list(results) 

    def find_topic_by_id(self, topic_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_topic_by_id, topic_ID)
        return results

    @staticmethod
    def _find_topic_by_id(tx, topic_ID):
        cypher_query = "MATCH (t:Topic {ID: " + str(topic_ID) + "}) " + \
                       " RETURN(t)"
        results = tx.run(cypher_query)
        return list(results)

    def find_educational_package_by_id(self, educational_package_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_educational_package_by_id, educational_package_ID)
        return results

    @staticmethod
    def _find_educational_package_by_id(tx, educational_package_ID):
        cypher_query = "MATCH (e:Educational_Package {ID: " + str(educational_package_ID) + "}) " + \
                       " RETURN(e)"
        results = tx.run(cypher_query)
        return list(results)

    def find_educational_package_by_topic(self, topic_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_educational_package_by_topic, topic_ID)
        return results

    @staticmethod
    def _find_educational_package_by_topic(tx, topic_id):
        cypher_query = "MATCH (t:Topic {ID: " + str(topic_id) + "})-[:has_educational_package]->(found_node:Educational_Package)" + \
                       " RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)

    def find_oer_by_id(self, oer_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_oer_by_id, oer_ID)
        return results

    @staticmethod
    def _find_oer_by_id(tx, oer_ID):
        cypher_query = "MATCH (o:OER {ID: " + str(oer_ID) + "}) " + \
                       " RETURN(o)"
        results = tx.run(cypher_query)
        return list(results)


    def find_oers_by_educational_package(self, educational_package_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_oers_by_educational_package, educational_package_ID)
        return results

    @staticmethod
    def _find_oers_by_educational_package(tx, educational_package_ID):
        cypher_query = "MATCH (t:Educational_Package {ID: " + str(educational_package_ID) + "})-[:has_oer]->(found_node:OER)" + \
                       " RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)


    def find_all_courses(self):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_all_courses)
        return results
# Remoon 
# return c to access all node properties
    @staticmethod
    def _find_all_courses(tx):
        cypher_query = "MATCH (c:Course) RETURN c"
        results = tx.run(cypher_query)
        return list(results)

    def find_all_journies(self):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_all_journies)
        return results

    @staticmethod
    def _find_all_journies(tx):
        cypher_query = "MATCH (j:Journey) RETURN j.title as title, j.ID as ID, j.industry as industry, j.description as description"
        results = tx.run(cypher_query)
        return list(results)
    
    def find_all_learn_materials(self):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_all_learn_materials)
        return results

    @staticmethod
    def _find_all_learn_materials(tx):

        try:
            cypher_query = "MATCH (found_node) WHERE found_node:Journey RETURN(found_node) ORDER BY found_node.ID"
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)

    

    def find_journies_by_industry(self, industry):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_journies_by_industry, industry)
        return results

    @staticmethod
    def _find_journies_by_industry(tx, industry):
        cypher_query = "MATCH (j:Journey {industry: '" + str(industry) + "'}) " + \
                       " RETURN j.title as title, j.ID as ID, j.industry as industry, j.description as description"
        results = tx.run(cypher_query)
        return list(results)
    
    def find_sessions(self, user_id):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_sessions, user_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_sessions(tx, user_id):
        try:
            cypher_query = "MATCH (u:User {id: " + str(user_id) + "})-[r]-(s:Session) " + \
                           "CALL { " + \
                                "WITH s "  + \
                                "OPTIONAL MATCH(s)-[rm:has_message]->(m:Message) " + \
                                "MATCH (m)<-[cm:created_message]-(mu:User) "+\
                                "RETURN m,mu " + \
                                "ORDER BY m.created_at DESC "+ \
                                "LIMIT 1 " + \
                           "} " + \
                           "RETURN DISTINCT s, collect(m) as m, collect(mu) as mu "+\
                           "ORDER BY m[0].created_at desc "
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)

    def find_session_by_id(self, session_id):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_session_by_id, session_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_session_by_id(tx, session_id):
        try:
            cypher_query = "MATCH (s:Session {id: \'"+str(session_id)+"\'}) " + \
                           "CALL { " + \
                                "WITH s "  + \
                                "OPTIONAL MATCH(s)-[rm:has_message]->(m:Message) " + \
                                "MATCH (m)<-[cm:created_message]-(mu:User) "+\
                                "RETURN m,mu " + \
                                "ORDER BY m.created_at DESC "+ \
                                "LIMIT 1 " + \
                           "} " + \
                           "RETURN DISTINCT s, collect(m) as m, collect(mu) as mu "+\
                           "ORDER BY m[0].created_at desc "
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)

    def find_messages(self, session_id):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_messages, session_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_messages(tx, session_id):
        try:
            cypher_query = "MATCH (s:Session {id: '" + str(session_id) + "'})-[hm:has_message]-(m:Message) " + \
                           "MATCH (m)<-[cm:created_message]-(u:User) " + \
                           "OPTIONAL MATCH (m)-[fi:file_info]->(f:File) "+\
                           "RETURN  m,u,f " + \
                           "ORDER BY m.created_at"
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)


    def find_file(self, file_id):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_file, file_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_file(tx, file_id):
        try:
            cypher_query = "MATCH (f:File {id: '" + str(file_id) + "'}) " + \
                           "RETURN  f "
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)

    def find_expert(self, exper_category):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_expert, exper_category)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_expert(tx, exper_category):
        try:
            cypher_query = "MATCH (u:User {expert: true, expert_category :'" + str(exper_category) + "'}) " + \
                           "RETURN  u, rand() as number " +\
                           "ORDER BY number " +\
                           "LIMIT 1 "
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)

    def find_invite(self, user_id, exper_category, session_id):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_invite, user_id, exper_category, session_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_invite(tx, user_id, exper_category, session_id):
        try:
            cypher_query = "MATCH (i:Invite {created_by: "+str(user_id)+" ,  expert_category :'" + str(exper_category) + "', session_id: '"+str(session_id)+"'}) " + \
                            "WHERE i.status = 'pending' OR i.status = 'accepted' " + \
                           "RETURN  i "
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)

    def find_invites(self, user_id):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_invites, user_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_invites(tx, user_id):
        try:
            cypher_query = "MATCH (e:User {id: "+str(user_id)+"})-[hi:has_invite]->(i:Invite { status: 'pending'}) " + \
                           "MATCH(i)<-[ci:created_invite]-(u:User) " +\
                           "RETURN  e,i,u "
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)


    def find_user(self, user_id):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_user, user_id)
        return result

    @staticmethod
    def _find_user(tx, user_id):
        try:
            cypher_query = "MATCH (found_node:User {" + \
                " id: " + str(user_id) + "}) RETURN(found_node)"
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)


    def set_sid(self, user_id, sid):
        with self.driver.session() as session:
            result = session.write_transaction(self._set_sid, user_id, sid)
        return result

    @staticmethod
    def _set_sid(tx, user_id, sid):
        try:
            cypher_query = "MATCH (n:User { id: " + str(user_id) +"}) SET n.sid = '" + sid + "'"
            tx.run(cypher_query)
        except Exception as e:
            logging.error(e)

    def find_component_by_journey_id(self, journey_id, user_id, component_type):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_component_by_journey_id, journey_id, user_id, component_type)
        return result

    @staticmethod
    def _find_component_by_journey_id(tx, journey_id, user_id, component_type):
        try:
            cypher_query = "MATCH (c:Component { " + \
                " journey_id: " + str(journey_id) + ", type: \'"+component_type+"\', user_id: "+str(user_id)+"}) " +\
                " RETURN c"
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)


    def find_members(self, session_id):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_members, session_id)
        return result

    @staticmethod
    def _find_members(tx, session_id):
        try:
            cypher_query = "MATCH (s:Session { id: \'" + str(session_id) + "\'})" +\
                " OPTIONAL MATCH(s)-[hm:has_member]->(u:User) "+\
                " MATCH(s)<-[cs:created_session]-(c:User) " +\
                " RETURN u,c"
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)

    def search_hybrid(self, query_embedding, query):
        with self.driver.session() as session:
            result = session.read_transaction(self._search_hybrid, query_embedding, query)
        return result

    @staticmethod
    def _search_hybrid(tx, query_embedding, query):


        try:
            #THIS SOLUTION IS USING FULL TEXT INDEX WITH LUCENE ENGINE
            # cypher_query = "CALL db.index.fulltext.queryNodes(\"gl_fulltext_node_index\",\""+str(query)+"\") "+\
            # "YIELD node, score " +\
            # "WITH DISTINCT node , score ORDER BY score DESC LIMIT 6 "+\
            # "OPTIONAL MATCH (node)-[hsrt:has_semantic_relation_to]-(m) "+\
            # "RETURN node as n,hsrt,m "

            #BAD BECAUSE ITS SEARCHING IN ENTIRE DATABASE , AND INDEXES IS IGNORED
            # cypher_query = "MATCH (n) WHERE n.title IS NOT NULL "+\
            # "AND apoc.text.sorensenDiceSimilarity(\""+str(query)+"\",  n.title) > 0.9 "+\
            # "OPTIONAL MATCH (n)-[hsrt:has_semantic_relation_to]-(m) "+\
            # "RETURN  n,hsrt,m "

            cypher_query = "MATCH (c:Centroid) "+\
            "WITH gds.similarity.cosine("+str(query_embedding)+", c.embedding) AS c_similarity, c.cluster as cluster_number " +\
            "ORDER BY c_similarity DESC LIMIT 6 "+\
            "MATCH(n) WHERE n.cluster_number = cluster_number "+\
            "WITH apoc.text.sorensenDiceSimilarity(\""+str(query)+"\", n.title) AS similarity, n "+\
            "WHERE similarity > 0.8 "+\
            "OPTIONAL MATCH (n)-[hsrt:has_semantic_relation_to]-(m) "+\
            "RETURN n,m,hsrt,similarity ORDER BY similarity DESC"
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)

    def search_semanticly(self, query_embedding):
        with self.driver.session() as session:
            result = session.read_transaction(self._search_semanticly, query_embedding)
        return result

    @staticmethod
    def _search_semanticly(tx, query_embedding):
        try:
            cypher_query = "MATCH (c:Centroid) "+\
            "WITH gds.similarity.cosine("+str(query_embedding)+", c.embedding) AS c_similarity, c.cluster as cluster_number " +\
            "ORDER BY c_similarity DESC LIMIT 6 "+\
            "MATCH(n) WHERE n.cluster_number = cluster_number "+\
            "WITH gds.similarity.cosine("+str(query_embedding)+", n.embedding) AS similarity, n "+\
            "ORDER BY similarity DESC LIMIT 6 "+\
            "OPTIONAL MATCH (n)-[hsrt:has_semantic_relation_to]-(m) "+\
            "RETURN n,m,hsrt,similarity ORDER BY similarity DESC"
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)

    def find_query_class(self, query_embedding):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_query_class, query_embedding)
        return result

    def find_closest_cluster(self, query_embedding):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_closest_cluster, query_embedding)
        return result

    @staticmethod
    def _find_closest_cluster(tx, query_embedding):
        try:
            cypher_query = "MATCH (c:Centroid) "+\
            "RETURN gds.similarity.cosine("+str(query_embedding)+", c.embedding) AS cluster_similarity, c.cluster as cluster_number, c.embedding as cluster_embedding " +\
            "ORDER BY cluster_similarity DESC LIMIT 1 "
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)

    def find_closest_cluster_except(self, target_cluster, query_embedding):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_closest_cluster_except, target_cluster, query_embedding)
        return result

    @staticmethod
    def _find_closest_cluster_except(tx, target_cluster_number, query_embedding):
        try:
            cypher_query = "MATCH (c:Centroid) "+\
            " WHERE c.cluster <> "+str(target_cluster_number)+\
            " RETURN gds.similarity.cosine("+str(query_embedding)+", c.embedding) AS cluster_similarity, c.cluster as cluster_number, c.embedding as cluster_embedding " +\
            " ORDER BY cluster_similarity DESC LIMIT 1 "
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)

    def find_cluster_threshold(self, cluster_embedding, cluster_number):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_cluster_threshold, cluster_embedding, cluster_number)
        return result

    @staticmethod
    def _find_cluster_threshold(tx, cluster_embedding, cluster_number):
        try:
            cypher_query = "MATCH(n) WHERE n.cluster_number = "+str(cluster_number)+\
            " RETURN gds.similarity.cosine("+str(cluster_embedding)+", n.embedding) AS similarity_threshold " +\
            " ORDER BY similarity_threshold ASC "+\
            " LIMIT 1"
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)


    def get_cluster_avg_embedding_with_exclude_node(self, selected_node_id, cluster_number):
        with self.driver.session() as session:
            result = session.read_transaction(self._get_cluster_avg_embedding_with_exclude_node, selected_node_id, cluster_number)
        return result

    @staticmethod
    def _get_cluster_avg_embedding_with_exclude_node(tx, selected_node_id, cluster_number):
        try:
            cypher_query = "MATCH (u {cluster_number : "+str(cluster_number)+"})"+\
            " WHERE (u:Journey OR u:Course OR u:Educational_Package OR u:Topic OR u:OER) AND u.ID <> "+str(selected_node_id) +\
            " WITH u.cluster_number AS cluster, u, range(0, 512) AS ii "+\
            " UNWIND ii AS i "+\
            " WITH cluster, i, avg(u.`embedding`[i]) AS avgVal "+\
            " ORDER BY cluster, i "+\
            " WITH cluster, collect(avgVal) AS avgEmbeddings "+\
            " RETURN cluster, avgEmbeddings"
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)

    def calculate_similarity(self, embedding1, embedding2):
        with self.driver.session() as session:
            result = session.read_transaction(self._calculate_similarity,  embedding1, embedding2)
        return result

    @staticmethod
    def _calculate_similarity(tx,  embedding1, embedding2):
        try:
            cypher_query = "RETURN gds.similarity.cosine("+str(embedding1)+", "+str(embedding2)+") AS cluster_similarity; "
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)


    def find_query_class(self, query_embedding):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_query_class, query_embedding)
        return result
    
    @staticmethod
    def _find_query_class(tx, query_embedding):
        try:
            cypher_query = "MATCH(qc:Query_Class) "+\
            "RETURN gds.similarity.cosine("+str(query_embedding)+", qc.embedding) as similarity, qc ORDER BY similarity DESC LIMIT 1"
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)


    def search_component(self, query_embedding, user_id):
        with self.driver.session() as session:
            result = session.read_transaction(self._search_component, query_embedding, user_id)
        return result

    @staticmethod
    def _search_component(tx, query_embedding, user_id):
        try:
            cypher_query = "MATCH (c:Component {user_id: "+str(user_id)+"}) "+\
            "RETURN gds.similarity.cosine("+str(query_embedding)+", c.embedding) AS c_similarity, c " +\
            "ORDER BY c_similarity DESC LIMIT 2"
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)

    def find_expert_categories(self):
        with self.driver.session() as session:
            result = session.read_transaction(self._find_expert_categories)
        return result

    @staticmethod
    def _find_expert_categories(tx):
        try:
            cypher_query = "MATCH (u:User {expert: true}) "+\
            "RETURN distinct u.expert_category as category"
            result = tx.run(cypher_query)
            return list(result)
        except Exception as e:
            logging.error(e)

    def find_bot_messages(self, session_id):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_bot_messages, session_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_bot_messages(tx, session_id):
        try:
            cypher_query = "MATCH (s:Session {id: '" + str(session_id) + "'})-[hm:has_message]-(m:Message {user_id : 9003}) " + \
                           "MATCH (m)<-[cm:created_message]-(u:User) " + \
                           "OPTIONAL MATCH (m)-[fi:file_info]->(f:File) "+\
                           "RETURN  m,u,f " + \
                           "ORDER BY m.created_at DESC"
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)

    def find_user_topics(self, user_id):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_user_topics, user_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_user_topics(tx, user_id):
        try:
            cypher_query = "MATCH (pt:Profile_Topic {user_id: " + str(user_id) + "}) " + \
                           "RETURN  pt "
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)
    

    def find_user_courses(self, user_id):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_user_courses, user_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_user_courses(tx, user_id):
        try:
            cypher_query = "MATCH (pc:Profile_Courses {user_id: " + str(user_id) + "}) " + \
                           "RETURN  pc "
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)


    def update_node(self, node_matching_type, node_matching_properties, properties):
        with self.driver.session() as session:
            result = session.write_transaction(self._update_node, node_matching_type, node_matching_properties, properties)
        return result

    @staticmethod
    def _update_node(tx, node_matching_type, node_matching_properties, properties):
        try:
  
            
            cypher_query = "MATCH (n:" + str(node_matching_type) + " {"
            for key in node_matching_properties:
                cypher_query += str(key) + ": "+ str(node_matching_properties[key])+','

            cypher_query = cypher_query[:-1]

            cypher_query+= "}) SET "


            for key in properties:
                typevar = type(properties[key])
                if type(properties[key]) is str or properties[key] is None:
                    cypher_query += "n."+str(key)+" = "+"\'"+str(properties[key])+"\'"+","
                else:
                    cypher_query += "n."+str(key)+" = "+str(properties[key])+","

            cypher_query = cypher_query[:-1]
            tx.run(cypher_query)
        except Exception as e:
            logging.error(e)

    def find_journey_history_by_id(self, user_id, journey_id):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_journey_history_by_id, user_id, journey_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_journey_history_by_id(tx, user_id, journey_id):
        try:
            cypher_query = "MATCH (jh:Journey_History {user_id: " + str(user_id) + ", journey_id: "+ str(journey_id)+"}) " + \
                           "RETURN  jh "
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)


    def find_journey_history(self, user_id):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_journey_history, user_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _find_journey_history(tx, user_id):
        try:
            cypher_query = "MATCH (jh:Journey_History {user_id: " + str(user_id) + "}) " + \
                           "RETURN  jh "
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)


    def get_latest_user_id(self):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._get_latest_user_id)
            results_dict_list = [dict(i) for i in results]
        return results_dict_list

    @staticmethod
    def _get_latest_user_id(tx):
        try:
            cypher_query = "MATCH (u:User) " + \
                           "RETURN u ORDER BY u.id DESC LIMIT 1 "
            results = tx.run(cypher_query)
            return list(results)
        except Exception as e:
            logging.error(e)

   
    def update_invite_by_session_id(self, user_id, session_id, status):
        with self.driver.session() as session:
            result = session.write_transaction(self._update_invite_by_session_id, user_id, session_id, status)
        return result

    @staticmethod
    def _update_invite_by_session_id(tx, user_id, session_id, status):
        try:
            cypher_query = "MATCH (u:User {id:"+str(user_id)+"})-[hi:has_invite]->(i:Invite {session_id: \'"+str(session_id)+"\'}) "+\
                           "SET i.status = \'"+status+"\'"
            tx.run(cypher_query)
        except Exception as e:
            logging.error(e)


    def remove_session_member(self, session_id, user_id):
        with self.driver.session() as session:
            result = session.write_transaction(self._remove_session_member, session_id, user_id)
        return result

    @staticmethod
    def _remove_session_member(tx, session_id, user_id):
        try:
            cypher_query = "MATCH (s:Session {id:\'"+str(session_id)+"\'})-[hm:has_member]->(u:User {id: "+str(user_id)+"}) "+\
                           "DELETE hm"
            tx.run(cypher_query)
        except Exception as e:
            logging.error(e)


    # Remoon
    def find_enrolled_journeys(self, user_id):
            with self.driver.session() as session:
                results = session.read_transaction(
                    self._find_enrolled_journeys, user_id)
                results_dict_list = [dict(i) for i in results]
            return results_dict_list

    @staticmethod
    def _find_enrolled_journeys(tx, user_id):
        try:
            cypher_query = """
                MATCH (u:User {id: $user_id})-[:ENROLLED_IN]->(j:Journey)
                RETURN j
                """
            results = tx.run(cypher_query, user_id=user_id)
            return list(results)
        except Exception as e:
            logging.error(e)            
   
    def find_journey_by_id(self, journey_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_journey_by_id, journey_ID)
        return results

    @staticmethod
    def _find_journey_by_id(tx, journey_ID):
        cypher_query = "MATCH (j:Journey {ID: " + str(journey_ID) + "}) " + \
                       " RETURN(j)"
        results = tx.run(cypher_query)
        return list(results)


    def find_all_education_packages(self):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_all_education_packages)
        return results
# Remoon
# return e to access all Education package properties
    @staticmethod
    def _find_all_education_packages(tx):
        # it will take long time add limit at end if you want some education packages
        cypher_query = "MATCH (e:Educational_Package) RETURN e"
        results = tx.run(cypher_query)
        return list(results)
    
    def find_all_oers(self):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_all_oers)
        return results
# Remoon
# return o to access all OER properties
    @staticmethod
    def _find_all_oers(tx):
         # it will take long time add limit at end if you want some education packages
        cypher_query = "MATCH (o:OER) RETURN o"
        results = tx.run(cypher_query)
        return list(results)
    # Remoon
    def find_topics_of_journey(self, journey_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_topics_of_journey, journey_ID)
        return results

    @staticmethod
    def _find_topics_of_journey(tx, journey_ID):
        cypher_query = "MATCH (:Journey {ID: " + str(journey_ID) + "})-[:has_course]->(:Course)-[:has_topic]->(found_node:Topic)" + \
                       " RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)
    
    def find_course_of_topic(self, topic_id):
        with self.driver.session() as session:
            result = session.read_transaction(
                self._find_course_of_topic, topic_id)
        return result

    @staticmethod
    def _find_course_of_topic(tx, topic_id):
        cypher_query = "MATCH (course:Course)-[:has_topic]->(:Topic {ID: " + str(topic_id) + "})" + \
                    " RETURN course.ID AS ID"
        result = tx.run(cypher_query).single()
        return result["ID"] if result else None
    

    def find_oers_of_journey(self, journey_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_oers_of_journey, journey_ID)
        return results

    @staticmethod
    def _find_oers_of_journey(tx, journey_ID):
        cypher_query = "MATCH (:Journey {ID: " + str(journey_ID) + "})-[:has_course]->(:Course)-[:has_topic]->(:Topic)-[:has_educational_package]->(:Educational_Package)-[:has_oer]->(found_node:OER)" + \
                       " RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)
    
    def find_eps_of_journey(self, journey_ID):
        with self.driver.session() as session:
            results = session.read_transaction(
                self._find_eps_of_journey, journey_ID)
        return results

    @staticmethod
    def _find_eps_of_journey(tx, journey_ID):
        cypher_query = "MATCH (:Journey {ID: " + str(journey_ID) + "})-[:has_course]->(:Course)-[:has_topic]->(:Topic)-[:has_educational_package]->(found_node:Educational_Package)" + \
                       " RETURN(found_node)"
        results = tx.run(cypher_query)
        return list(results)