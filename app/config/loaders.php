
<?php
use Phalcon\Loader;

$loader = new Loader();
/*$loader->registerNamespaces(array(
                                'RestApi\Api\Controllers' => __DIR__ . '/../controllers/',
                                'RestApi\Api\Models' => __DIR__ . '/../models/',
                                'RestApi\Api\Services' => __DIR__ . '/../services/',
                            ));*/

$loader->registerDirs(array(
                          __DIR__ . '../controllers/',
                          __DIR__ . '../models/'
                      ))->register();

//$loader->register();