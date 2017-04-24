<?php

/*
use Phalcon\Mvc\View;
use Phalcon\Mvc\Application;
use Phalcon\Di\FactoryDefault;
use Phalcon\Mvc\Url as UrlProvider;
use Phalcon\Db\Adapter\Pdo\Mysql as DbAdapter;*/

use Phalcon\Mvc\Application;
use Phalcon\Loader;
use Phalcon\Mvc\Router;
use Phalcon\Mvc\Url as UrlResolver;
use Phalcon\DI\FactoryDefault;
use Phalcon\Session\Adapter\Files as SessionAdapter;
use Phalcon\Db\Adapter\Pdo\Mysql as DbAdapter;
use Phalcon\Mvc\ModuleDefinitionInterface;
use Phalcon\Mvc\View;
use Phalcon\Mvc\Router\Annotations as RouterAnnotations;
use Phalcon\Security;

try {

    $loader = new Loader();
    $loader->registerDirs(array(
                              __DIR__ . '/controllers/',
                              __DIR__ . '/models/'
                          ))->register();

    $di = new FactoryDefault();

    $di['router'] = function () {
        $router = new RouterAnnotations(false);

        $router->setDefaultModule("api");
        $router->notFound(array("controller" => "rest", "action" => "route404"));
        //$router->addModuleResource("api", "Index");
        $router->addResource('Index', '/api');

        return $router;
    };

    $di->set('db', function () {
        return new DbAdapter(
            array(
                "host"     => "kryzhani.mysql.ukraine.com.ua",
                "username" => "kryzhani_cal2017",
                "password" => "qpnyphwk",
                "dbname"   => "kryzhani_cal2017",
                "options" => array(
                    PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'
                )
            )
        );
    });

    $di->set('url', function () {
        $url = new UrlProvider();
        //$url->setBaseUri('/api/');
        return $url;
    });

    $di['session'] = function () {
        $session = new SessionAdapter();
        $session->start();
        return $session;
    };

    $application = new Application($di);
    $application->useImplicitView(false);

    $application->registerModules(array(
                                      'api' => array(
                                          'className' => 'Module',
                                          'path'      => __DIR__ . '/Module.php'
                                      )
                                  ));

    //require __DIR__ . '/config/modules.php';

    echo $application->handle()->getContent();

} catch (\Exception $e) {
    echo $e->getMessage() . " " . $e->getTraceAsString();
}