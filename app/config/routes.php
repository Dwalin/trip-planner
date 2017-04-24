<?php
/**
 * @var $routes \Phalcon\Mvc\Router\Annotations
 */
$router->setDefaultModule("api");
//$router->setDefaultNamespace("../controllers/");
$router->notFound(array("controller" => "rest", "action" => "route404"));
$router->addModuleResource("api", "Index");